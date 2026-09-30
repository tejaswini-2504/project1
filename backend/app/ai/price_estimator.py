"""
Rule-based price estimator.
Returns a price range for a given service name.
Can be replaced with ML model later.
"""

PRICE_RANGES: dict[str, tuple[int, int]] = {
    "Plumber":                  (300, 1500),
    "Electrician":              (300, 2000),
    "Carpenter":                (400, 2500),
    "Painter":                  (500, 5000),
    "Mason":                    (500, 3000),
    "Cleaner":                  (300, 800),
    "Deep Cleaning":            (800, 3000),
    "Sofa Cleaning":            (400, 1200),
    "Bathroom Cleaning":        (300, 800),
    "Babysitter":               (400, 1000),
    "Elderly Care":             (500, 1200),
    "Nanny":                    (500, 1500),
    "Home Cook":                (400, 1500),
    "Catering":                 (5000, 50000),
    "Home Baker":               (300, 3000),
    "Tiffin":                   (1500, 5000),
    "Beautician":               (300, 2000),
    "Barber":                   (100, 500),
    "Makeup":                   (1000, 5000),
    "Mehendi":                  (300, 2000),
    "Mechanic":                 (500, 5000),
    "Car Wash":                 (200, 800),
    "Bike Repair":              (200, 2000),
    "Mobile Repair":            (300, 3000),
    "Laptop Repair":            (500, 5000),
    "Printer Repair":           (300, 2000),
    "Wi-Fi Repair":             (300, 1000),
    "AC Repair":                (500, 3000),
    "Refrigerator Repair":      (500, 3000),
    "Washing Machine Repair":   (400, 2500),
    "TV Repair":                (300, 2500),
    "Tailor":                   (200, 2000),
    "Laundry":                  (200, 1000),
    "Florist":                  (300, 5000),
    "Photographer":             (2000, 20000),
    "Gift Services":            (300, 5000),
    "Tutor":                    (300, 1500),
    "Music Teacher":            (500, 2000),
    "Fitness Trainer":          (500, 2000),
    "Event Services":           (5000, 100000),
}

DEFAULT_RANGE = (300, 2000)


def estimate(service_name: str) -> dict:
    low, high = PRICE_RANGES.get(service_name, DEFAULT_RANGE)
    return {
        "service": service_name,
        "min_price": low,
        "max_price": high,
        "currency": "INR",
        "note": "Estimated range. Final price depends on scope and provider.",
    }
