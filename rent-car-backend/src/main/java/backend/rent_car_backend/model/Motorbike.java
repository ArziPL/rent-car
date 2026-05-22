package backend.rent_car_backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "motorbikes")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Motorbike extends Vehicle {

    @Enumerated(EnumType.STRING)
    @Column(name = "license_category", nullable = false)
    private LicenseCategory licenseCategory;

    @Column(name = "price_per_day", nullable = false)
    private BigDecimal pricePerDay;

    @Column(nullable = false)
    private boolean available;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}