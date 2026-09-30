"""
AI service facade.
All AI calls go through here so swapping providers (OpenAI, Ollama, etc.) is a one-file change.
"""

from app.ai.problem_classifier import classify, ClassificationResult
from app.ai.price_estimator import estimate


def analyze_problem(problem: str, location: str = "") -> dict:
    result: ClassificationResult = classify(problem)
    price_est = estimate(result.service)
    return {
        "category": result.category,
        "service": result.service,
        "problem_summary": result.problem_summary,
        "urgency": result.urgency,
        "confidence": round(result.confidence, 2),
        "suggestions": result.suggestions,
        "keywords_matched": result.keywords_matched,
        "price_estimate": price_est,
        "location": location,
    }


def get_price_estimate(service_name: str, details: str = "") -> dict:
    return estimate(service_name)
