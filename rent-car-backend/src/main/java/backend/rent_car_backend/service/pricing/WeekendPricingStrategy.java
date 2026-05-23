package backend.rent_car_backend.service.pricing;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;

@Component
@Primary
public class WeekendPricingStrategy implements PricingStrategy {

    private static final BigDecimal WEEKEND_MULTIPLIER = new BigDecimal("1.5");

    @Override
    public BigDecimal calculate(LocalDate start, LocalDate end, BigDecimal pricePerDay) {
        if (!end.isAfter(start)) {
            return BigDecimal.ZERO;
        }
        long weekendDays = 0;
        long weekdays = 0;
        LocalDate current = start;
        while (current.isBefore(end)) {
            DayOfWeek day = current.getDayOfWeek();
            if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
                weekendDays++;
            } else {
                weekdays++;
            }
            current = current.plusDays(1);
        }
        BigDecimal weekdayTotal = pricePerDay.multiply(BigDecimal.valueOf(weekdays));
        BigDecimal weekendTotal = pricePerDay.multiply(WEEKEND_MULTIPLIER).multiply(BigDecimal.valueOf(weekendDays));
        return weekdayTotal.add(weekendTotal);
    }
}
