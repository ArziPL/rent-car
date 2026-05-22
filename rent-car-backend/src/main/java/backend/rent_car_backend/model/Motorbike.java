package backend.rent_car_backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "motorbikes")
@PrimaryKeyJoinColumn(name = "id")
@DiscriminatorValue("MOTORBIKE")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Motorbike extends Vehicle {

    @Enumerated(EnumType.STRING)
    @Column(name = "license_category", nullable = false)
    private LicenseCategory licenseCategory;

    @Enumerated(EnumType.STRING)
    @Column(name = "motorbike_type", nullable = false)
    private MotorbikeType motorbikeType;

    @Column(nullable = false)
    private boolean abs;
}