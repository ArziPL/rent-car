package backend.rent_car_backend.service;

import backend.rent_car_backend.dto.ReservationRequest;
import backend.rent_car_backend.dto.ReservationResponse;
import backend.rent_car_backend.model.Car;
import backend.rent_car_backend.model.FuelType;
import backend.rent_car_backend.model.Reservation;
import backend.rent_car_backend.model.ReservationStatus;
import backend.rent_car_backend.model.Role;
import backend.rent_car_backend.model.Transmission;
import backend.rent_car_backend.model.User;
import backend.rent_car_backend.repository.ReservationRepository;
import backend.rent_car_backend.repository.UserRepository;
import backend.rent_car_backend.repository.VehicleRepository;
import backend.rent_car_backend.service.pricing.PricingStrategy;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock private ReservationRepository reservationRepository;
    @Mock private VehicleRepository vehicleRepository;
    @Mock private UserRepository userRepository;
    @Mock private PricingStrategy pricingStrategy;

    @InjectMocks
    private ReservationService reservationService;

    private static final LocalDate START = LocalDate.now().plusDays(1);
    private static final LocalDate END = LocalDate.now().plusDays(4);
    private static final String EMAIL = "user@test.com";

    private Car buildCar(boolean available) {
        return Car.builder()
                .id(1L).brand("Toyota").model("Corolla").year(2022)
                .engineCc(1800).pricePerDay(new BigDecimal("100.00")).available(available)
                .numSeats(5).transmission(Transmission.MANUAL).fuelType(FuelType.PETROL)
                .build();
    }

    private User buildUser() {
        return User.builder().id(1L).email(EMAIL).password("hashed").role(Role.USER).build();
    }

    private Reservation buildReservation(ReservationStatus status) {
        Car car = buildCar(true);
        User user = buildUser();
        return Reservation.builder()
                .id(1L).vehicle(car).user(user)
                .startDate(START).endDate(END)
                .status(status)
                .totalPrice(new BigDecimal("300.00"))
                .build();
    }

    private ReservationRequest validRequest() {
        return ReservationRequest.builder()
                .vehicleId(1L).startDate(START).endDate(END)
                .build();
    }

    @Test
    void create_success_returnsResponse() {
        Car car = buildCar(true);
        User user = buildUser();
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(car));
        when(reservationRepository.existsOverlapping(eq(1L), any(), any(), eq(ReservationStatus.CONFIRMED))).thenReturn(false);
        when(pricingStrategy.calculate(any(), any(), any())).thenReturn(new BigDecimal("300.00"));
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(reservationRepository.save(any())).thenAnswer(inv -> {
            Reservation r = inv.getArgument(0);
            return Reservation.builder()
                    .id(1L).vehicle(r.getVehicle()).user(r.getUser())
                    .startDate(r.getStartDate()).endDate(r.getEndDate())
                    .status(r.getStatus()).totalPrice(r.getTotalPrice())
                    .build();
        });

        ReservationResponse response = reservationService.create(validRequest(), EMAIL);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getVehicleId()).isEqualTo(1L);
        assertThat(response.getTotalPrice()).isEqualByComparingTo("300.00");
    }

    @Test
    void create_vehicleNotFound_throwsEntityNotFoundException() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reservationService.create(validRequest(), EMAIL))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void create_vehicleUnavailable_throwsIllegalArgument() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(buildCar(false)));

        assertThatThrownBy(() -> reservationService.create(validRequest(), EMAIL))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not available");
    }

    @Test
    void create_endBeforeStart_throwsIllegalArgument() {
        ReservationRequest badDates = ReservationRequest.builder()
                .vehicleId(1L).startDate(END).endDate(START).build();
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(buildCar(true)));

        assertThatThrownBy(() -> reservationService.create(badDates, EMAIL))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("End date must be after start date");
    }

    @Test
    void create_overlapExists_throwsIllegalArgument() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(buildCar(true)));
        when(reservationRepository.existsOverlapping(eq(1L), any(), any(), eq(ReservationStatus.CONFIRMED))).thenReturn(true);

        assertThatThrownBy(() -> reservationService.create(validRequest(), EMAIL))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("confirmed reservation");
    }

    @Test
    void cancel_ownPendingReservation_setsStatusCancelled() {
        Reservation reservation = buildReservation(ReservationStatus.PENDING);
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));

        reservationService.cancel(1L, EMAIL);

        assertThat(reservation.getStatus()).isEqualTo(ReservationStatus.CANCELLED);
        verify(reservationRepository).save(reservation);
    }

    @Test
    void cancel_notOwner_throwsIllegalArgument() {
        Reservation reservation = buildReservation(ReservationStatus.PENDING);
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));

        assertThatThrownBy(() -> reservationService.cancel(1L, "other@test.com"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Not your reservation");
    }

    @Test
    void cancel_nonPendingReservation_throwsIllegalArgument() {
        Reservation reservation = buildReservation(ReservationStatus.CONFIRMED);
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));

        assertThatThrownBy(() -> reservationService.cancel(1L, EMAIL))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("PENDING");
    }

    @Test
    void updateStatus_toConfirmed_updatesStatus() {
        Reservation reservation = buildReservation(ReservationStatus.PENDING);
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
        when(reservationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ReservationResponse response = reservationService.updateStatus(1L, ReservationStatus.CONFIRMED);

        assertThat(response.getStatus()).isEqualTo(ReservationStatus.CONFIRMED);
    }

    @Test
    void updateStatus_toCompleted_updatesStatus() {
        Reservation reservation = buildReservation(ReservationStatus.CONFIRMED);
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
        when(reservationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ReservationResponse response = reservationService.updateStatus(1L, ReservationStatus.COMPLETED);

        assertThat(response.getStatus()).isEqualTo(ReservationStatus.COMPLETED);
    }

    @Test
    void cancel_completedReservation_throwsIllegalArgument() {
        Reservation reservation = buildReservation(ReservationStatus.COMPLETED);
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));

        assertThatThrownBy(() -> reservationService.cancel(1L, EMAIL))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("PENDING");
    }

    @Test
    void updateStatus_toPending_throwsIllegalArgument() {
        Reservation reservation = buildReservation(ReservationStatus.CONFIRMED);
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));

        assertThatThrownBy(() -> reservationService.updateStatus(1L, ReservationStatus.PENDING))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("PENDING");
    }

    @Test
    void findAll_returnsMappedList() {
        when(reservationRepository.findAll()).thenReturn(List.of(buildReservation(ReservationStatus.PENDING)));

        List<ReservationResponse> result = reservationService.findAll();

        assertThat(result).hasSize(1);
    }

    @Test
    void findByCurrentUser_returnsMappedList() {
        User user = buildUser();
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(reservationRepository.findByUserId(1L)).thenReturn(List.of(buildReservation(ReservationStatus.PENDING)));

        List<ReservationResponse> result = reservationService.findByCurrentUser(EMAIL);

        assertThat(result).hasSize(1);
    }
}
