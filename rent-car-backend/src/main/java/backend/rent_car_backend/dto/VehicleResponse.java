package backend.rent_car_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleResponse {

    private Long id;
    private String brand;
    private String model;
    private int year;
    private BigDecimal pricePerDay;
    private boolean available;
    private String type;
}
