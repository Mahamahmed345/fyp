import os
import joblib
import pandas as pd
import sys

# --------------------------
# Key Normalizer
# --------------------------
# def normalize_key(text):
#     text = text.lower()
#     text = text.replace(" ", "_")
#     text = re.sub(r'[^a-z0-9]+', '_', text)
#     return text.strip('_')

# --------------------------
# Payday Flag
# --------------------------
def is_payday(date):
    if isinstance(date, str):
        date = pd.to_datetime(date)
    return 1 if (date.day >= 28 or date.day <= 5) else 0

# --------------------------
# Load All Models
# --------------------------
# @st.cache_resource
# def load_all_models(models_dir="models"):
#     models = {}
#     if not os.path.exists(models_dir):
#         print("❌ Models folder not found")
#         return models
#     for file in os.listdir(models_dir):
#         if not file.endswith(".pkl"):
#             continue
#         key_name = normalize_key(file.replace(".pkl","").replace("prophet_",""))
#         try:
#             models[key_name] = joblib.load(os.path.join(models_dir, file))
#             print(f"✅ Loaded model: {key_name}")
#         except Exception as e:
#             print(f"❌ Failed to load {file}: {e}")
#     return models
def get_model(models_dir, model_name):
    path = os.path.join(models_dir, f"prophet_{model_name}.pkl")
    return joblib.load(path)
# --------------------------
# Load Dynamic Pricing Model
# --------------------------

# def load_dynamic_pricing_model(model_path="dynamic_pricing_model.pkl"):
#     if not os.path.exists(model_path):
#         print("Dynamic pricing model not found. Using heuristic.", file=sys.stderr)
#         return None
#     return joblib.load(model_path)
def load_dynamic_pricing_model(model_path="dynamic_pricing_model.pkl"):
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    full_path = os.path.join(BASE_DIR, model_path)

    if not os.path.exists(full_path):
        print("NOT FOUND", file=sys.stderr)
        return None

    print("✅ LOADING MODEL...", file=sys.stderr)
    model = joblib.load(full_path)
    print("✅ MODEL LOADED SUCCESSFULLY", file=sys.stderr)
    
    return model
# --------------------------
# Stock Status
# --------------------------
def stock_status(current_stock, predicted_upper):
    if current_stock < predicted_upper:
        return "Critical: Reorder Now", "red"
    elif current_stock < predicted_upper * 1.2:
        return "Warning: Low Stock", "orange"
    else:
        return "Stable", "green"

# --------------------------
# Prediction
# --------------------------
def get_prediction(model_data, current_stock, base_price, days_ahead=1, item=None, warehouse=None, pricing_model=None):
   
    # Handle Prophet model format
    if isinstance(model_data, dict):
        model = model_data.get("model")
        confidence = model_data.get("confidence", 75)
    else:
        model = model_data
        confidence = 75

    # --------------------------
    # Create future dataframe
    # --------------------------
    future = model.make_future_dataframe(periods=days_ahead)

    future["is_payday"] = future["ds"].apply(is_payday)
    future["day_of_week"] = future["ds"].dt.dayofweek

    # 🔴 FIX: Add Unit_Price column (required regressor)
    future["Unit_Price"] = base_price
    future["Discount_Percent"] = 0
    future["Revenue"] = base_price * current_stock

    # --------------------------
# Auto add missing regressors
# --------------------------
    for reg in model.extra_regressors:
      if reg not in future.columns:
        future[reg] = 0

    # --------------------------
    # Predict demand
    # --------------------------
    forecast = model.predict(future)

    predicted_units = max(0, int(forecast.iloc[-1]["yhat"]))
    predicted_upper = int(forecast.iloc[-1]["yhat_upper"])

    status, color = stock_status(current_stock, predicted_upper)

    # --------------------------
    # Prepare feature dataframe for pricing model
    # --------------------------
    item_types = ["Book", "Cloth", "Electronic", "Toy"]
    warehouses = ["WH-1", "WH-2", "WH-3", "WH-4"]

    feature_df = pd.DataFrame([{
        "units_sold": predicted_units,
        "stock_level": current_stock,
        "base_price": base_price,
        "is_payday": future["is_payday"].iloc[-1],
        "day_of_week": future["day_of_week"].iloc[-1],
        **{f"item_type_{t}": 1 if item and item.lower().startswith(t.lower()) else 0 for t in item_types},
        **{f"warehouse_id_{wh}": 1 if warehouse == wh else 0 for wh in warehouses}
    }])

    # --------------------------
    # Get suggested price
    # --------------------------
    print("prising model",pricing_model, file=sys.stderr)
    if pricing_model:
        predicted_price = float(pricing_model.predict(feature_df)[0])
        predicted_price = min(base_price * 1.5, max(base_price * 0.9, predicted_price))
    else:
        predicted_price = base_price

    # --------------------------
    # Restock amount
    # --------------------------
    restock_amount = max(0, predicted_upper - current_stock)

    return {
        "demand": predicted_units,
        "predicted_upper": predicted_upper,
        "status": status,
        "color": color,
        "price": round(predicted_price, 2),
        "confidence": round(confidence, 2),
        "restock": restock_amount
    }