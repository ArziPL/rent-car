package backend.rent_car_backend.service.pricing;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface PricingStrategy {

    BigDecimal calculate(LocalDate start, LocalDate end, BigDecimal pricePerDay);
}
