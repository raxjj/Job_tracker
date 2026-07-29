package com.jobtracker.controller;

import com.jobtracker.dto.DashboardStatsResponse;
import com.jobtracker.dto.JobApplicationRequest;
import com.jobtracker.dto.JobApplicationResponse;
import com.jobtracker.dto.PageResponse;
import com.jobtracker.model.ApplicationStatus;
import com.jobtracker.service.JobApplicationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@Tag(name = "Job Applications", description = "CRUD endpoints for tracking job applications")
public class JobApplicationController {

    private final JobApplicationService applicationService;

    @PostMapping
    public ResponseEntity<JobApplicationResponse> create(Authentication auth,
                                                           @Valid @RequestBody JobApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(applicationService.create(auth.getName(), request));
    }

    @GetMapping
    public ResponseEntity<PageResponse<JobApplicationResponse>> list(
            Authentication auth,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"));
        return ResponseEntity.ok(applicationService.list(auth.getName(), status, search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobApplicationResponse> getById(Authentication auth, @PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getById(auth.getName(), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobApplicationResponse> update(Authentication auth, @PathVariable Long id,
                                                           @Valid @RequestBody JobApplicationRequest request) {
        return ResponseEntity.ok(applicationService.update(auth.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication auth, @PathVariable Long id) {
        applicationService.delete(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> stats(Authentication auth) {
        return ResponseEntity.ok(applicationService.getDashboardStats(auth.getName()));
    }
}
