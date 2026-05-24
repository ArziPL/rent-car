package backend.rent_car_backend.controller;

import backend.rent_car_backend.dto.AdminReservationResponse;
import backend.rent_car_backend.dto.ReservationRequest;
import backend.rent_car_backend.dto.ReservationResponse;
import backend.rent_car_backend.dto.UpdateReservationStatusRequest;
import backend.rent_car_backend.exception.GlobalExceptionHandler;
import backend.rent_car_backend.model.ReservationStatus;
import backend.rent_car_backend.service.ReservationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ReservationControllerTest {

    @Mock private ReservationService reservationService;

    private MockMvc userMvc;
    private MockMvc adminMvc;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    private static final String USER_EMAIL = "user@test.com";

    @BeforeEach
    void setUp() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(USER_EMAIL, null, List.of())
        );
        userMvc = MockMvcBuilders
                .standaloneSetup(new ReservationController(reservationService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        adminMvc = MockMvcBuilders
                .standaloneSetup(new ReservationAdminController(reservationService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private ReservationResponse reservationResponse() {
        return ReservationResponse.builder()
                .id(1L).vehicleId(1L).vehicleBrand("Toyota").vehicleModel("Corolla")
                .startDate(LocalDate.now().plusDays(1)).endDate(LocalDate.now().plusDays(4))
                .status(ReservationStatus.PENDING).totalPrice(new BigDecimal("300.00"))
                .build();
    }

    @Test
    void createReservation_valid_returns201() throws Exception {
        ReservationRequest request = ReservationRequest.builder()
                .vehicleId(1L)
                .startDate(LocalDate.now().plusDays(1))
                .endDate(LocalDate.now().plusDays(4))
                .build();
        when(reservationService.create(any(), eq(USER_EMAIL))).thenReturn(reservationResponse());

        userMvc.perform(post("/api/reservations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void createReservation_missingVehicleId_returns400() throws Exception {
        ReservationRequest invalid = ReservationRequest.builder()
                .startDate(LocalDate.now().plusDays(1))
                .endDate(LocalDate.now().plusDays(4))
                .build();

        userMvc.perform(post("/api/reservations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getMyReservations_returns200() throws Exception {
        when(reservationService.findByCurrentUser(USER_EMAIL)).thenReturn(List.of(reservationResponse()));

        userMvc.perform(get("/api/reservations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }

    @Test
    void cancelReservation_existing_returns204() throws Exception {
        doNothing().when(reservationService).cancel(1L, USER_EMAIL);

        userMvc.perform(delete("/api/reservations/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void cancelReservation_notOwner_returns400() throws Exception {
        doThrow(new IllegalArgumentException("Not your reservation"))
                .when(reservationService).cancel(eq(1L), eq(USER_EMAIL));

        userMvc.perform(delete("/api/reservations/1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Not your reservation"));
    }

    @Test
    void adminGetAllReservations_returns200WithUserInfo() throws Exception {
        AdminReservationResponse adminResponse = AdminReservationResponse.builder()
                .id(1L).vehicleId(1L).vehicleBrand("Toyota").vehicleModel("Corolla")
                .startDate(LocalDate.now().plusDays(1)).endDate(LocalDate.now().plusDays(4))
                .status(ReservationStatus.PENDING).totalPrice(new BigDecimal("300.00"))
                .userId(42L).userEmail("owner@test.com")
                .build();
        when(reservationService.findAllAsAdmin()).thenReturn(List.of(adminResponse));

        adminMvc.perform(get("/api/admin/reservations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].userId").value(42))
                .andExpect(jsonPath("$[0].userEmail").value("owner@test.com"));
    }

    @Test
    void adminUpdateStatus_toConfirmed_returns200() throws Exception {
        ReservationResponse confirmed = reservationResponse();
        confirmed.setStatus(ReservationStatus.CONFIRMED);
        UpdateReservationStatusRequest req = new UpdateReservationStatusRequest(ReservationStatus.CONFIRMED);
        when(reservationService.updateStatus(eq(1L), eq(ReservationStatus.CONFIRMED))).thenReturn(confirmed);

        adminMvc.perform(put("/api/admin/reservations/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    @Test
    void adminUpdateStatus_toPending_returns400() throws Exception {
        when(reservationService.updateStatus(eq(1L), eq(ReservationStatus.PENDING)))
                .thenThrow(new IllegalArgumentException("Cannot set status back to PENDING"));

        UpdateReservationStatusRequest req = new UpdateReservationStatusRequest(ReservationStatus.PENDING);
        adminMvc.perform(put("/api/admin/reservations/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }
}
