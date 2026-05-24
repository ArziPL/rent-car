package backend.rent_car_backend.controller;

import backend.rent_car_backend.dto.VehicleReportResponse;
import backend.rent_car_backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/report")
@RequiredArgsConstructor
public class ReportAdminController {

    private final ReportService reportService;

    @GetMapping("/vehicles")
    public ResponseEntity<List<VehicleReportResponse>> getVehicleReport() {
        return ResponseEntity.ok(reportService.getVehicleReport());
    }
}
