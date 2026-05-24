package backend.rent_car_backend.service;

import backend.rent_car_backend.dto.CarReportResponse;
import backend.rent_car_backend.model.Car;
import backend.rent_car_backend.model.FuelType;
import backend.rent_car_backend.model.Reservation;
import backend.rent_car_backend.model.ReservationStatus;
import backend.rent_car_backend.model.Role;
import backend.rent_car_backend.model.Transmission;
import backend.rent_car_backend.model.User;
import backend.rent_car_backend.repository.CarRepository;
import backend.rent_car_backend.repository.ReservationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock private CarRepository carRepository;
    @Mock private ReservationRepository reservationRepository;

    @InjectMocks
    private ReportService reportService;

    private Car buildCar() {
        return Car.builder()
                .id(1L).brand("Toyota").model("Corolla").year(2022)
                .engineCc(1800).pricePerDay(new BigDecimal("100.00")).available(true)
                .numSeats(5).transmission(Transmission.MANUAL).fuelType(FuelType.PETROL)
                .build();
    }

    private User buildUser() {
        return User.builder().id(1L).email("user@test.com").password("hashed").role(Role.USER).build();
    }

    private Reservation buildReservation(Car car, ReservationStatus status, LocalDate start, LocalDate end, BigDecimal price) {
        return Reservation.builder()
                .id(1L).vehicle(car).user(buildUser())
                .startDate(start).endDate(end)
                .status(status).totalPrice(price)
                .build();
    }

    @Test
    void getCarReport_returnsStatsPerCar() {
        Car car = buildCar();
        // Mon 2026-05-25 → Thu 2026-05-28 = 3 weekday days (Mon, Tue, Wed)
        Reservation r1 = buildReservation(car, ReservationStatus.CONFIRMED,
                LocalDate.of(2026, 5, 25), LocalDate.of(2026, 5, 28), new BigDecimal("300.00"));
        // Fri 2026-05-29 → Mon 2026-06-01 = 1 weekday (Fri) + 2 weekend (Sat, Sun)
        Reservation r2 = buildReservation(car, ReservationStatus.COMPLETED,
                LocalDate.of(2026, 5, 29), LocalDate.of(2026, 6, 1), new BigDecimal("350.00"));

        when(carRepository.findAll()).thenReturn(List.of(car));
        when(reservationRepository.findByVehicle(car)).thenReturn(List.of(r1, r2));

        List<CarReportResponse> result = reportService.getCarReport();

        assertThat(result).hasSize(1);
        CarReportResponse report = result.get(0);
        assertThat(report.getReservationCount()).isEqualTo(2);
        assertThat(report.getTotalRevenue()).isEqualByComparingTo("650.00");
        assertThat(report.getWeekdayDays()).isEqualTo(4);  // Mon+Tue+Wed + Fri
        assertThat(report.getWeekendDays()).isEqualTo(2);  // Sat+Sun
    }

    @Test
    void getCarReport_excludesCancelledReservations() {
        Car car = buildCar();
        Reservation confirmed = buildReservation(car, ReservationStatus.CONFIRMED,
                LocalDate.of(2026, 5, 25), LocalDate.of(2026, 5, 28), new BigDecimal("300.00"));
        Reservation cancelled = buildReservation(car, ReservationStatus.CANCELLED,
                LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 4), new BigDecimal("300.00"));

        when(carRepository.findAll()).thenReturn(List.of(car));
        when(reservationRepository.findByVehicle(car)).thenReturn(List.of(confirmed, cancelled));

        List<CarReportResponse> result = reportService.getCarReport();

        CarReportResponse report = result.get(0);
        assertThat(report.getReservationCount()).isEqualTo(1);
        assertThat(report.getTotalRevenue()).isEqualByComparingTo("300.00");
    }

    @Test
    void getCarReport_noReservations_returnsZeroStats() {
        Car car = buildCar();

        when(carRepository.findAll()).thenReturn(List.of(car));
        when(reservationRepository.findByVehicle(car)).thenReturn(List.of());

        List<CarReportResponse> result = reportService.getCarReport();

        CarReportResponse report = result.get(0);
        assertThat(report.getReservationCount()).isEqualTo(0);
        assertThat(report.getTotalRevenue()).isEqualByComparingTo("0.00");
        assertThat(report.getWeekdayDays()).isEqualTo(0);
        assertThat(report.getWeekendDays()).isEqualTo(0);
    }
}
