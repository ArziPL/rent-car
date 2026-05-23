package backend.rent_car_backend.dto;

import backend.rent_car_backend.model.ReservationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateReservationStatusRequest {

    @NotNull(message = "Status is required")
    private ReservationStatus status;
}
