package backend.rent_car_backend.dto;

import backend.rent_car_backend.model.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminReservationResponse {

    private Long id;
    private Long vehicleId;
    private String vehicleBrand;
    private String vehicleModel;
    private String vehicleType;
    private LocalDate startDate;
    private LocalDate endDate;
    private ReservationStatus status;
    private BigDecimal totalPrice;
    private LocalDateTime createdAt;

    // Owner info — visible to admins only
    private Long userId;
    private String userEmail;
}
