"""
Rule-based AI problem classifier.
No external API required — works fully offline.
Architecture allows plugging in a real LLM later by replacing classify().
"""

from __future__ import annotations
import re
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class ClassificationResult:
    category: str
    service: str
    problem_summary: str
    urgency: str          # LOW / NORMAL / HIGH / URGENT
    confidence: float     # 0.0 – 1.0
    suggestions: list[str] = field(default_factory=list)
    keywords_matched: list[str] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Knowledge base – keyword → (category, service, urgency_boost)
# ---------------------------------------------------------------------------
RULES: list[tuple[list[str], str, str, str]] = [
    # keywords, category, service, urgency_hint
    (["leak", "leaking", "pipe burst", "water dripping", "tap dripping", "faucet"],
     "Home Repair", "Plumber", "HIGH"),
    (["drain", "drainage", "blocked drain", "clogged pipe", "sewer"],
     "Home Repair", "Plumber", "NORMAL"),
    (["no electricity", "power cut", "tripping", "short circuit", "electrical", "wiring", "fuse",
      "socket", "switch not working", "fan not working", "light not working"],
     "Home Repair", "Electrician", "HIGH"),
    (["ceiling", "wall crack", "plaster", "tile", "floor", "brick", "cement", "mason", "construction"],
     "Home Repair", "Mason", "NORMAL"),
    (["paint", "painting", "wall paint", "colour", "whitewash"],
     "Home Repair", "Painter", "NORMAL"),
    (["door", "wood", "wardrobe", "furniture repair", "carpenter", "hinge", "cabinet"],
     "Home Repair", "Carpenter", "NORMAL"),
    (["clean", "cleaning", "maid", "housekeeping", "sweep", "mop", "dust"],
     "Home Care", "Cleaner", "NORMAL"),
    (["deep clean", "deep cleaning"],
     "Home Care", "Deep Cleaning", "NORMAL"),
    (["sofa clean", "sofa wash", "upholstery"],
     "Home Care", "Sofa Cleaning", "NORMAL"),
    (["bathroom clean", "toilet clean", "bathroom cleaning"],
     "Home Care", "Bathroom Cleaning", "NORMAL"),
    (["babysit", "babysitter", "baby", "nanny", "toddler", "infant"],
     "Care", "Babysitter", "NORMAL"),
    (["elderly", "old person", "senior", "elder care", "grandparent"],
     "Care", "Elderly Care", "NORMAL"),
    (["cook", "cooking", "chef", "meal", "food", "tiffin", "lunch", "dinner"],
     "Food", "Home Cook", "NORMAL"),
    (["catering", "party food", "event catering"],
     "Food", "Catering", "NORMAL"),
    (["baker", "baking", "cake", "pastry"],
     "Food", "Home Baker", "NORMAL"),
    (["beautician", "beauty", "facial", "waxing", "eyebrows", "threading", "manicure", "pedicure"],
     "Personal Care", "Beautician", "NORMAL"),
    (["barber", "haircut", "hair cut", "shave", "trim"],
     "Personal Care", "Barber", "NORMAL"),
    (["makeup", "bridal", "party makeup"],
     "Personal Care", "Makeup", "NORMAL"),
    (["mehendi", "henna"],
     "Personal Care", "Mehendi", "NORMAL"),
    (["car wash", "vehicle wash", "bike wash"],
     "Vehicle", "Car Wash", "NORMAL"),
    (["mechanic", "car repair", "vehicle repair", "car service", "engine", "tyre"],
     "Vehicle", "Mechanic", "HIGH"),
    (["bike repair", "two wheeler", "scooter repair"],
     "Vehicle", "Bike Repair", "NORMAL"),
    (["mobile", "phone repair", "screen crack", "phone screen", "smartphone"],
     "Tech Repair", "Mobile Repair", "NORMAL"),
    (["laptop", "computer repair", "pc repair", "laptop screen"],
     "Tech Repair", "Laptop Repair", "NORMAL"),
    (["printer", "printer repair"],
     "Tech Repair", "Printer Repair", "NORMAL"),
    (["wifi", "wi-fi", "internet", "router", "network", "broadband"],
     "Tech Repair", "Wi-Fi Repair", "NORMAL"),
    (["ac", "air conditioner", "air conditioning", "not cooling", "ac repair", "airconditioner"],
     "Appliance", "AC Repair", "HIGH"),
    (["fridge", "refrigerator", "freezer", "cooling"],
     "Appliance", "Refrigerator Repair", "HIGH"),
    (["washing machine", "washer", "laundry machine"],
     "Appliance", "Washing Machine Repair", "HIGH"),
    (["tv", "television", "tv repair", "tv not working", "screen broken"],
     "Appliance", "TV Repair", "NORMAL"),
    (["tailor", "stitch", "stitching", "alter", "alteration", "dress"],
     "Small Business", "Tailor", "NORMAL"),
    (["laundry", "dry clean", "ironing", "pressing"],
     "Small Business", "Laundry", "NORMAL"),
    (["flower", "bouquet", "florist", "floral"],
     "Small Business", "Florist", "NORMAL"),
    (["photo", "photographer", "photography", "picture"],
     "Small Business", "Photographer", "NORMAL"),
    (["gift", "hamper", "gifting"],
     "Small Business", "Gift Services", "NORMAL"),
    (["tutor", "tutoring", "teaching", "homework help", "coaching"],
     "Learning", "Tutor", "NORMAL"),
    (["music", "instrument", "guitar", "piano", "singing"],
     "Learning", "Music Teacher", "NORMAL"),
    (["fitness", "gym trainer", "personal trainer", "yoga", "exercise"],
     "Learning", "Fitness Trainer", "NORMAL"),
    (["event", "wedding", "party planning", "decoration", "decor"],
     "Learning", "Event Services", "NORMAL"),
]

URGENCY_KEYWORDS = {
    "URGENT": ["urgent", "emergency", "asap", "immediately", "right now", "flooding", "fire", "burning",
               "sparks", "burst", "gushing", "no power", "help"],
    "HIGH": ["leak", "broken", "not working", "stopped working", "dead", "no hot water",
             "electrical fault", "short circuit"],
}


def _normalize(text: str) -> str:
    return text.lower()


def _detect_urgency(text: str, rule_urgency: str) -> str:
    t = _normalize(text)
    for level in ("URGENT", "HIGH"):
        if any(kw in t for kw in URGENCY_KEYWORDS[level]):
            return level
    return rule_urgency


def _summarize(text: str, service: str) -> str:
    t = text.strip()
    if len(t) < 80:
        return t
    return t[:77] + "..."


def classify(problem: str) -> ClassificationResult:
    """
    Rule-based classification. Returns a ClassificationResult.
    Replace this function body with an LLM call to upgrade to AI-powered.
    """
    t = _normalize(problem)
    best_score = 0
    best_rule = None
    matched_keywords: list[str] = []

    for keywords, category, service, urgency_hint in RULES:
        score = 0
        local_matched: list[str] = []
        for kw in keywords:
            if kw in t:
                score += 1
                local_matched.append(kw)
        if score > best_score:
            best_score = score
            best_rule = (category, service, urgency_hint)
            matched_keywords = local_matched

    if best_rule is None or best_score == 0:
        # Fallback
        return ClassificationResult(
            category="General",
            service="General Service",
            problem_summary=_summarize(problem, "General"),
            urgency="NORMAL",
            confidence=0.3,
            suggestions=["Please provide more details about your problem."],
        )

    category, service, urgency_hint = best_rule
    urgency = _detect_urgency(problem, urgency_hint)
    confidence = min(0.95, 0.5 + best_score * 0.15)

    suggestions = _build_suggestions(service, urgency)

    return ClassificationResult(
        category=category,
        service=service,
        problem_summary=_summarize(problem, service),
        urgency=urgency,
        confidence=confidence,
        suggestions=suggestions,
        keywords_matched=matched_keywords,
    )


def _build_suggestions(service: str, urgency: str) -> list[str]:
    base: list[str] = [f"A certified {service} can resolve this quickly."]
    if urgency in ("URGENT", "HIGH"):
        base.insert(0, "This looks urgent. We recommend booking as soon as possible.")
    tips = {
        "Plumber": ["Turn off the main water valve to prevent flooding.", "Take photos to show the plumber."],
        "Electrician": ["Switch off the main MCB for safety.", "Do not touch any exposed wires."],
        "AC Repair": ["Check if the power supply is fine.", "Clean the filter — it may just need cleaning."],
        "Refrigerator Repair": ["Empty perishables to prevent spoilage."],
        "Cleaner": ["Put valuables away before the cleaner arrives."],
    }
    base.extend(tips.get(service, []))
    return base[:3]
