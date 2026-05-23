package backend.rent_car_backend.service;

import backend.rent_car_backend.service.pricing.StandardPricingStrategy;
import backend.rent_car_backend.service.pricing.WeekendPricingStrategy;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class PricingStrategyTest {

    private final StandardPricingStrategy standard = new StandardPricingStrategy();
    private final WeekendPricingStrategy weekend = new WeekendPricingStrategy();

    // 2024-01-01 is a Monday
    private static final LocalDate MONDAY = LocalDate.of(2024, 1, 1);
    private static final LocalDate FRIDAY = LocalDate.of(2024, 1, 5);
    private static final LocalDate SATURDAY = LocalDate.of(2024, 1, 6);
    private static final LocalDate SUNDAY = LocalDate.of(2024, 1, 7);
    private static final LocalDate NEXT_MONDAY = LocalDate.of(2024, 1, 8);
    private static final BigDecimal PRICE = new BigDecimal("100.00");

    // --- StandardPricingStrategy ---

    @Test
    void standard_allWeekdays_returnsCorrectTotal() {
        // Mon to Fri = 4 days
        BigDecimal result = standard.calculate(MONDAY, FRIDAY, PRICE);
        assertThat(result.compareTo(new BigDecimal("400.00"))).isZero();
    }

    @Test
    void standard_singleDay_returnsPricePerDay() {
        BigDecimal result = standard.calculate(MONDAY, MONDAY.plusDays(1), PRICE);
        assertThat(result.compareTo(new BigDecimal("100.00"))).isZero();
    }

    @Test
    void standard_zeroDays_returnsZero() {
        BigDecimal result = standard.calculate(MONDAY, MONDAY, PRICE);
        assertThat(result.compareTo(BigDecimal.ZERO)).isZero();
    }

    // --- WeekendPricingStrategy ---

    @Test
    void weekend_allWeekdays_sameAsStandard() {
        // Mon to Fri = 4 weekdays
        BigDecimal result = weekend.calculate(MONDAY, FRIDAY, PRICE);
        assertThat(result.compareTo(new BigDecimal("400.00"))).isZero();
    }

    @Test
    void weekend_pureWeekend_appliesMultiplier() {
        // Sat + Sun = 2 weekend days × 1.5
        BigDecimal result = weekend.calculate(SATURDAY, NEXT_MONDAY, PRICE);
        assertThat(result.compareTo(new BigDecimal("300.00"))).isZero();
    }

    @Test
    void weekend_mixedWeek_correctlyMixesPricing() {
        // Mon to next Mon = 5 weekdays + 2 weekend days
        BigDecimal result = weekend.calculate(MONDAY, NEXT_MONDAY, PRICE);
        // 5 × 100 + 2 × 150 = 500 + 300 = 800
        assertThat(result.compareTo(new BigDecimal("800.00"))).isZero();
    }

    @Test
    void weekend_singleWeekendDay_appliesMultiplier() {
        BigDecimal result = weekend.calculate(SATURDAY, SUNDAY, PRICE);
        assertThat(result.compareTo(new BigDecimal("150.00"))).isZero();
    }

    @Test
    void weekend_zeroDays_returnsZero() {
        BigDecimal result = weekend.calculate(MONDAY, MONDAY, PRICE);
        assertThat(result.compareTo(BigDecimal.ZERO)).isZero();
    }
}
