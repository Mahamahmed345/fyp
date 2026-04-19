const express = require("express");
const audit = require("../controller/auditController");
const db = require("../db");

const router = express.Router();

// Existing Audit Routes
router.get("/audit-summary", audit.getAuditSummary);
router.get("/anomalies", audit.getAnomalies);
router.post("/audit-report", audit.generateAuditReport);

// ✅ STRATEGIC DASHBOARD INTELLIGENCE
router.get("/dashboard-intelligence", async (req, res) => {
    try {
        const storeParam = req.query.store || 'WH-1';
        let whId = storeParam.toUpperCase().replace('STORE ', 'WH-').replace('S1', 'WH-1').replace('S2', 'WH-2').replace('S3', 'WH-3').replace('S4', 'WH-4');
        if (!whId.startsWith('WH-')) whId = `WH-${whId}`;

        // Fetch categorical operational metrics + detailed anomalies
        const mainQuery = `
            SELECT 
                Category as category,
                SUM(Stock_Level) as stock,
                SUM(Units_Sold) as demand,
                AVG(Unit_Price) as avg_price,
                SUM(fault_loss_sale) as loss_sale_count,
                SUM(fault_revenue_gap) as revenue_gap_count,
                SUM(fault_dead_stock) as dead_stock_count,
                SUM(fault_market_price) as market_gap_count,
                SUM(fault_market_price + fault_dead_stock + fault_loss_sale + fault_revenue_gap) as total_anomalies,
                COUNT(*) as total_items,
                MAX(Date) as lastSync
            FROM vw_smart_stock_analysis
            WHERE Warehouse_ID = ?
            AND Date = (SELECT MAX(Date) FROM cleaned_smart_stock)
            GROUP BY Category
        `;

        const timeSeriesQuery = `
            SELECT Date as date, SUM(Units_Sold) as daily_demand
            FROM cleaned_smart_stock
            WHERE Warehouse_ID = ?
            GROUP BY Date
            ORDER BY Date DESC
            LIMIT 7
        `;
        
        const [results, tsResults] = await Promise.all([
            db.query(mainQuery, [whId]),
            db.query(timeSeriesQuery, [whId])
        ]);

        const rows = Array.isArray(results) ? results : (results[0] || []);
        const tsRows = Array.isArray(tsResults) ? tsResults : (tsResults[0] || []);

        let totalStock = 0;
        let totalAnomalies = 0;
        let totalValuation = 0;
        let totalItems = 0;
        let faultBreakdown = { lossSale: 0, revenueGap: 0, deadStock: 0, marketGap: 0 };

        const shelfData = rows.map(row => {
            const stock = parseFloat(row.stock || 0);
            const demand30d = parseFloat(row.demand || 0);
            const dailyDemand = demand30d / 30;
            const price = parseFloat(row.avg_price || 0);
            const anomalies = parseInt(row.total_anomalies || 0);
            const items = parseInt(row.total_items || 1);
            
            totalStock += stock;
            totalAnomalies += anomalies;
            totalValuation += stock * price;
            totalItems += items;

            // Aggregate Fault Breakdown
            faultBreakdown.lossSale += parseInt(row.loss_sale_count || 0);
            faultBreakdown.revenueGap += parseInt(row.revenue_gap_count || 0);
            faultBreakdown.deadStock += parseInt(row.dead_stock_count || 0);
            faultBreakdown.marketGap += parseInt(row.market_gap_count || 0);

            const daysOfCover = dailyDemand > 0 ? (stock / dailyDemand).toFixed(1) : 30;
            let status = 'Healthy';
            if (stock < dailyDemand * 7) status = 'Critical';
            else if (daysOfCover < 10) status = 'Low';

            // Real Accuracy: Ratio of normal items to total items in category
            const categoryAccuracy = ((items - anomalies) / items * 100).toFixed(1);

            return {
                category: row.category,
                stock: Math.round(stock),
                demand: Math.round(demand30d), // Historical Demand (30 days)
                demand7d: Math.round(dailyDemand * 7), // 7-Day Forecast
                avg_price: price,
                daysOfCover,
                status,
                accuracy: categoryAccuracy,
                fulfillment: status === 'Healthy' ? 'Optimized' : 'Restock Req.'
            };
        });

        // Global (Store-Specific) Integrity Score
        const globalAccuracy = totalItems > 0 ? ((totalItems - totalAnomalies) / totalItems * 100).toFixed(1) : 98.5;
        const mae = (100 - globalAccuracy).toFixed(2); // Error margin derived from anomaly rate

        res.json({
            storeId: whId,
            lastTerminalSync: rows[0]?.lastSync || new Date().toISOString(),
            kpis: {
                shelfUtilization: ((totalStock / 15000) * 100).toFixed(1) + "%",
                anomalyCount: totalAnomalies,
                forecastMarginMAE: mae + "%",
                capitalAtRisk: Math.round(totalValuation)
            },
            faultBreakdown,
            categoricalData: shelfData,
            timeSeriesDemand: tsRows.reverse().map(ts => ({
                date: ts.date,
                demand: ts.daily_demand
            })),
            transferSuggestions: shelfData
                .filter(d => d.status === 'Critical')
                .map(d => ({
                    msg: `Action: Request ${d.demand7d * 2} units of ${d.category} from Store ${whId === 'WH-1' ? '2' : '1'}`,
                    priority: 'High'
                }))
        });
    } catch (err) {
        console.error("❌ Dashboard Intelligence Router Error:", err);
        res.status(500).json({ error: "Failed to fetch operational intelligence" });
    }
});

router.get("/admin/strategic-analytics", (req, res) => {
    res.json({ status: "Route Registered in auditRoutes" });
});

module.exports = router;