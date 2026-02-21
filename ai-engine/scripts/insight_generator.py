"""
Generative AI Insight Report Engine
Generates professional business insights from AI predictions
"""

import sys
import json

def generate_insight_report(data_dict):
    """
    Generate comprehensive business insight report
    
    Args:
        data_dict: Dictionary containing:
            - demand_forecast: dict with growth_percentage, confidence
            - anomaly_status: dict with anomaly, score
            - risk_level: str (LOW/MEDIUM/HIGH)
            - risk_probability: float
            - top_factors: list of risk factors
    
    Returns:
        Professional multi-line business report
    """
    
    # Extract data
    demand_forecast = data_dict.get('demand_forecast', {})
    anomaly_status = data_dict.get('anomaly_status', {})
    risk_level = data_dict.get('risk_level', 'UNKNOWN')
    risk_probability = data_dict.get('risk_probability', 0)
    top_factors = data_dict.get('top_factors', [])
    
    growth_pct = demand_forecast.get('growth_percentage', 0)
    confidence = demand_forecast.get('confidence', 0)
    is_anomaly = anomaly_status.get('anomaly', False)
    anomaly_score = anomaly_status.get('score', 0)
    
    # Build report sections
    report_lines = []
    
    # Header
    report_lines.append("=" * 80)
    report_lines.append("AI-GENERATED SUPPLY CHAIN INTELLIGENCE REPORT")
    report_lines.append("=" * 80)
    report_lines.append("")
    
    # 1. Demand Forecast Section
    report_lines.append("📊 DEMAND FORECAST ANALYSIS")
    report_lines.append("-" * 80)
    
    if growth_pct > 0:
        report_lines.append(f"Demand is projected to INCREASE by {abs(growth_pct):.1f}% over the next 30 days.")
        if growth_pct > 15:
            report_lines.append("⚠️  ALERT: Significant demand surge expected. Immediate action required.")
        elif growth_pct > 10:
            report_lines.append("📈 Moderate growth anticipated. Prepare for increased orders.")
        else:
            report_lines.append("✓ Steady growth pattern detected. Normal operations recommended.")
    elif growth_pct < 0:
        report_lines.append(f"Demand is projected to DECREASE by {abs(growth_pct):.1f}% over the next 30 days.")
        if abs(growth_pct) > 15:
            report_lines.append("⚠️  ALERT: Significant demand drop expected. Review inventory levels.")
        else:
            report_lines.append("📉 Slight decline anticipated. Monitor market conditions.")
    else:
        report_lines.append("Demand is projected to remain STABLE over the next 30 days.")
    
    report_lines.append(f"Forecast Confidence: {confidence:.0f}%")
    report_lines.append("")
    
    # 2. Anomaly Detection Section
    report_lines.append("🔍 ANOMALY DETECTION STATUS")
    report_lines.append("-" * 80)
    
    if is_anomaly:
        severity = anomaly_status.get('severity', 'MEDIUM')
        report_lines.append(f"⚠️  ANOMALY DETECTED - Severity: {severity}")
        report_lines.append("Unusual patterns identified in recent shipment data.")
        report_lines.append(f"Anomaly Score: {anomaly_score:.3f} (lower values indicate higher anomaly)")
        report_lines.append("")
        report_lines.append("Recommended Actions:")
        report_lines.append("  • Investigate recent transactions for irregularities")
        report_lines.append("  • Verify temperature and handling compliance")
        report_lines.append("  • Review supplier and distributor performance")
    else:
        report_lines.append("✓ NO ANOMALIES DETECTED")
        report_lines.append("All recent shipments are within normal operational parameters.")
        report_lines.append("Supply chain operations are functioning as expected.")
    
    report_lines.append("")
    
    # 3. Risk Assessment Section
    report_lines.append("⚡ RISK ASSESSMENT")
    report_lines.append("-" * 80)
    
    report_lines.append(f"Current Risk Level: {risk_level}")
    report_lines.append(f"Risk Probability: {risk_probability:.1%}")
    
    if risk_level == "HIGH":
        report_lines.append("")
        report_lines.append("🚨 HIGH RISK ALERT - Immediate intervention required!")
        report_lines.append("")
        report_lines.append("Critical Risk Factors:")
        for i, factor in enumerate(top_factors[:3], 1):
            report_lines.append(f"  {i}. {factor.replace('_', ' ').title()}")
        report_lines.append("")
        report_lines.append("Urgent Actions Required:")
        if 'delay_days' in top_factors:
            report_lines.append("  • Address delivery delays - review logistics and routes")
        if 'temperature' in top_factors:
            report_lines.append("  • Investigate temperature control issues - check cold chain")
        if 'stock_level' in top_factors:
            report_lines.append("  • Replenish inventory immediately - prevent stockouts")
        if 'demand' in top_factors:
            report_lines.append("  • Adjust supply planning - align with demand fluctuations")
            
    elif risk_level == "MEDIUM":
        report_lines.append("")
        report_lines.append("⚠️  MODERATE RISK - Proactive monitoring recommended")
        report_lines.append("")
        report_lines.append("Key Risk Factors:")
        for i, factor in enumerate(top_factors[:3], 1):
            report_lines.append(f"  {i}. {factor.replace('_', ' ').title()}")
        report_lines.append("")
        report_lines.append("Recommended Actions:")
        report_lines.append("  • Increase monitoring frequency for flagged parameters")
        report_lines.append("  • Prepare contingency plans for potential disruptions")
        report_lines.append("  • Review and optimize current operational procedures")
        
    else:  # LOW
        report_lines.append("")
        report_lines.append("✓ LOW RISK - Operations within acceptable parameters")
        report_lines.append("")
        report_lines.append("Maintain current operational standards and continue routine monitoring.")
    
    report_lines.append("")
    
    # 4. Strategic Recommendations
    report_lines.append("💡 STRATEGIC RECOMMENDATIONS")
    report_lines.append("-" * 80)
    
    recommendations = []
    
    # Inventory recommendations based on demand
    if growth_pct > 15:
        recommendations.append(f"• INCREASE buffer stock by {min(int(growth_pct * 1.2), 25)}% to meet projected demand surge")
    elif growth_pct > 5:
        recommendations.append(f"• ADJUST inventory levels by {int(growth_pct)}% to align with demand growth")
    elif growth_pct < -10:
        recommendations.append(f"• REDUCE inventory by {min(abs(int(growth_pct)), 20)}% to prevent overstocking")
    else:
        recommendations.append("• MAINTAIN current inventory levels - demand stable")
    
    # Risk-based recommendations
    if risk_level == "HIGH":
        recommendations.append("• IMPLEMENT emergency response protocols immediately")
        recommendations.append("• ESCALATE to senior management for strategic intervention")
    elif risk_level == "MEDIUM":
        recommendations.append("• REINFORCE monitoring protocols and inspection frequency")
        recommendations.append("• PREPARE backup suppliers and alternative routes")
    else:
        recommendations.append("• CONTINUE standard operations with routine monitoring")
    
    # Anomaly-based recommendations
    if is_anomaly:
        recommendations.append("• CONDUCT thorough audit of flagged transactions")
        recommendations.append("• VERIFY blockchain integrity and data authenticity")
    
    # Quality recommendations
    recommendations.append("• MAINTAIN temperature compliance across all shipments (15°C - 30°C)")
    recommendations.append("• ENSURE blockchain verification for all transactions")
    
    for rec in recommendations:
        report_lines.append(rec)
    
    report_lines.append("")
    
    # 5. Performance Metrics
    report_lines.append("📈 KEY PERFORMANCE INDICATORS")
    report_lines.append("-" * 80)
    report_lines.append(f"Forecast Accuracy:        {confidence:.0f}%")
    report_lines.append(f"Risk Assessment:          {risk_level} ({risk_probability:.1%})")
    report_lines.append(f"Anomaly Status:           {'DETECTED' if is_anomaly else 'CLEAR'}")
    report_lines.append(f"Operational Health:       {calculate_health_score(growth_pct, risk_probability, is_anomaly)}")
    report_lines.append("")
    
    # 6. Next Steps
    report_lines.append("🎯 IMMEDIATE NEXT STEPS (Priority Order)")
    report_lines.append("-" * 80)
    
    next_steps = []
    priority = 1
    
    if risk_level == "HIGH":
        next_steps.append(f"{priority}. Address high-risk factors: {', '.join(top_factors[:2])}")
        priority += 1
    
    if is_anomaly:
        next_steps.append(f"{priority}. Investigate detected anomalies in supply chain data")
        priority += 1
    
    if abs(growth_pct) > 10:
        next_steps.append(f"{priority}. Adjust inventory and procurement based on {abs(growth_pct):.1f}% demand change")
        priority += 1
    
    next_steps.append(f"{priority}. Review and optimize logistics for cost efficiency")
    priority += 1
    next_steps.append(f"{priority}. Conduct routine blockchain verification and compliance checks")
    
    for step in next_steps:
        report_lines.append(step)
    
    report_lines.append("")
    report_lines.append("=" * 80)
    report_lines.append("Report generated by AGR·CHAIN AI Intelligence Engine")
    report_lines.append("=" * 80)
    
    return "\n".join(report_lines)

def calculate_health_score(growth_pct, risk_prob, is_anomaly):
    """Calculate overall operational health score"""
    score = 100
    
    # Deduct for high risk
    score -= risk_prob * 30
    
    # Deduct for anomalies
    if is_anomaly:
        score -= 15
    
    # Deduct for extreme demand changes
    if abs(growth_pct) > 20:
        score -= 10
    
    score = max(0, min(100, score))
    
    if score >= 80:
        return f"EXCELLENT ({score:.0f}/100)"
    elif score >= 60:
        return f"GOOD ({score:.0f}/100)"
    elif score >= 40:
        return f"FAIR ({score:.0f}/100)"
    else:
        return f"POOR ({score:.0f}/100)"

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # CLI mode - receive JSON input
        try:
            input_json = sys.argv[1]
            input_data = json.loads(input_json)
            report = generate_insight_report(input_data)
            print(report)
        except Exception as e:
            print(json.dumps({"error": str(e)}))
    else:
        # Test mode
        test_data = {
            "demand_forecast": {
                "growth_percentage": 12.5,
                "confidence": 85
            },
            "anomaly_status": {
                "anomaly": False,
                "score": -0.15
            },
            "risk_level": "MEDIUM",
            "risk_probability": 0.55,
            "top_factors": ["delay_days", "temperature", "demand"]
        }
        
        report = generate_insight_report(test_data)
        print(report)
