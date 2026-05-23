package backend.rent_car_backend.service.pricing;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Component
public class StandardPricingStrategy implements PricingStrategy {

    @Override
    public BigDecimal calculate(LocalDate start, LocalDate end, BigDecimal pricePerDay) {
        long days = ChronoUnit.DAYS.between(start, end);
        if (days <= 0) {
            return BigDecimal.ZERO;
        }
        return pricePerDay.multiply(BigDecimal.valueOf(days));
    }
}
