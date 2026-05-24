package backend.rent_car_backend.dto;

import backend.rent_car_backend.model.FuelType;
import backend.rent_car_backend.model.Transmission;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarResponse {

    private String type;
    private Long id;
    private String brand;
    private String model;
    private int year;
    private int engineCc;
    private BigDecimal pricePerDay;
    private int numSeats;
    private Transmission transmission;
    private FuelType fuelType;
    private boolean available;
    private LocalDateTime createdAt;
}
