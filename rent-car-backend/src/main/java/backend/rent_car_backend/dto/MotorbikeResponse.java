package backend.rent_car_backend.dto;

import backend.rent_car_backend.model.LicenseCategory;
import backend.rent_car_backend.model.MotorbikeType;
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
public class MotorbikeResponse {

    private Long id;
    private String brand;
    private String model;
    private int year;
    private int engineCc;
    private BigDecimal pricePerDay;
    private LicenseCategory licenseCategory;
    private MotorbikeType motorbikeType;
    private boolean abs;
    private boolean available;
    private LocalDateTime createdAt;
}
