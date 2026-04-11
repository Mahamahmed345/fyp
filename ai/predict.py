import sys
import json
import time
import os
from engine import get_prediction,load_dynamic_pricing_model,get_model

pricing_model =load_dynamic_pricing_model()
print("prising model",pricing_model, file=sys.stderr)
store = sys.argv[1]
item = sys.argv[2]
stock = int(sys.argv[3])
base_price = float(sys.argv[4])
# key = normalize_key(f"{store}_{item}")
key1 = f"{store}_{item}"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_PATH = os.path.join(BASE_DIR, "models")
data_model= get_model(MODELS_PATH, key1)
if data_model is None:
    result = {
    "error": "First Train model"
}
else:
    start = time.time()
    result = get_prediction(data_model,current_stock=stock, base_price=base_price,days_ahead=1,item=item,warehouse=store,pricing_model=pricing_model)
    duration = time.time() - start
    result["duration"]=duration

print(json.dumps(result))
