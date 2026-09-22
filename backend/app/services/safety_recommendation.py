def generate_safety_message(data, risk):
    suggestions = []

    weather = data.get("weather_condition")
    traffic = data.get("traffic_density")
    road_quality = data.get("road_quality_score")
    stress = data.get("stress_index")
    experience = data.get("driver_experience_level")

    if risk == "Low":
        title = "RoadSense — Safe Driving"

        suggestions.append(
            "Good job! Current conditions are low risk."
        )

        suggestions.append(
            "Continue driving safely and follow traffic rules."
        )

        suggestions.append(
            "Maintain a safe following distance and obey speed limits."
        )

    elif risk == "Medium":
        title = "RoadSense — Stay Alert"

        suggestions.append(
            "Caution: Medium traffic risk detected."
        )

        suggestions.append(
            "Reduce speed and maintain a safe following distance."
        )

        suggestions.append(
            "Avoid sudden lane changes and unnecessary overtaking."
        )

    else:
        title = "RoadSense — High Risk Detected"

        suggestions.append(
            "High traffic risk detected. Drive with extra caution."
        )

        suggestions.append(
            "Slow down and maintain extra following distance."
        )

        suggestions.append(
            "Avoid unnecessary overtaking and sudden manoeuvres."
        )

        suggestions.append(
            "If conditions become unsafe, stop at a safe location."
        )

    if weather == "Rainy":
        suggestions.append(
            "Rain detected: reduce speed and allow extra braking distance."
        )

    elif weather == "Foggy":
        suggestions.append(
            "Fog detected: reduce speed and increase visibility distance."
        )

    if traffic >= 70:
        suggestions.append(
            "Heavy traffic detected: remain patient and avoid aggressive manoeuvres."
        )

    if road_quality <= 5:
        suggestions.append(
            "Poor road quality detected: reduce speed and watch for road hazards."
        )

    if stress >= 70:
        suggestions.append(
            "High driver stress detected: stay calm and avoid aggressive driving."
        )

    if experience == "Beginner" and risk != "Low":
        suggestions.append(
            "Take extra caution in the current conditions."
        )

    body = " ".join(suggestions[:5])

    return {
        "title": title,
        "body": body
    }