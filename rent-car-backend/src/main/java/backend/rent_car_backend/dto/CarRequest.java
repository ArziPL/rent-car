package backend.rent_car_backend.dto;

import backend.rent_car_backend.model.FuelType;
import backend.rent_car_backend.model.Transmission;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarRequest {

    @NotBlank(message = "Brand is required")
    private String brand;

    @NotBlank(message = "Model is required")
    private String model;

    @NotNull(message = "Year is required")
    @Min(value = 1900, message = "Year must be at least 1900")
    @Max(value = 2100, message = "Year must be at most 2100")
    private Integer year;

    @Positive(message = "Engine CC must be positive")
    private int engineCc;

    @NotNull(message = "Price per day is required")
    @Positive(message = "Price per day must be positive")
    private BigDecimal pricePerDay;

    @Positive(message = "Number of seats must be positive")
    private int numSeats;

    @NotNull(message = "Transmission is required")
    private Transmission transmission;

    @NotNull(message = "Fuel type is required")
    private FuelType fuelType;

    private Boolean available;
}
