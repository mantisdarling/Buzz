import os
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
PYTORCH_MODEL_DIR = os.path.join(MODEL_DIR, "distilbert_finetuned")
ONNX_MODEL_PATH = os.path.join(MODEL_DIR, "distilbert.onnx")

def export_to_onnx():
    """
    Exports the fine-tuned DistilBERT PyTorch model to ONNX.
    """
    if not os.path.exists(PYTORCH_MODEL_DIR):
        print(f"Fine-tuned PyTorch model not found at {PYTORCH_MODEL_DIR}.")
        print("Please run train_distilbert.py first.")
        return
        
    print(f"Loading PyTorch model from {PYTORCH_MODEL_DIR}...")
    model = AutoModelForSequenceClassification.from_pretrained(PYTORCH_MODEL_DIR)
    tokenizer = AutoTokenizer.from_pretrained(PYTORCH_MODEL_DIR)
    
    # Place model in evaluation mode
    model.eval()
    
    # Sample input for trace (length 128)
    text = "This is a sample article text used to trace the computational graph for ONNX export."
    inputs = tokenizer(text, return_tensors="pt", max_length=128, truncation=True, padding="max_length")
    
    input_ids = inputs["input_ids"]
    attention_mask = inputs["attention_mask"]
    
    print(f"Exporting PyTorch model to ONNX format at {ONNX_MODEL_PATH}...")
    
    # Export the model
    with torch.no_grad():
        torch.onnx.export(
            model,
            (input_ids, attention_mask),
            ONNX_MODEL_PATH,
            input_names=["input_ids", "attention_mask"],
            output_names=["logits"],
            dynamic_axes={
                "input_ids": {0: "batch_size", 1: "sequence_length"},
                "attention_mask": {0: "batch_size", 1: "sequence_length"},
                "logits": {0: "batch_size"}
            },
            opset_version=14
        )
        
    print(f"Model exported successfully. Checking ONNX file size: {os.path.getsize(ONNX_MODEL_PATH) / (1024*1024):.2f} MB")
    
    # Verify ONNX model loads with onnxruntime
    try:
        import onnxruntime as ort
        print("Verifying ONNX model load with ONNX Runtime...")
        session = ort.InferenceSession(ONNX_MODEL_PATH)
        print("ONNX model loaded successfully with ONNX Runtime!")
    except Exception as e:
        print(f"Failed to verify ONNX model load: {e}")

if __name__ == "__main__":
    export_to_onnx()
