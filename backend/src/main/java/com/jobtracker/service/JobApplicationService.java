package com.jobtracker.service;

import com.jobtracker.dto.DashboardStatsResponse;
import com.jobtracker.dto.JobApplicationRequest;
import com.jobtracker.dto.JobApplicationResponse;
import com.jobtracker.dto.PageResponse;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.model.ApplicationStatus;
import com.jobtracker.model.JobApplication;
import com.jobtracker.model.User;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class JobApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    @Transactional
    public JobApplicationResponse create(String userEmail, JobApplicationRequest request) {
        User user = getUser(userEmail);

        JobApplication application = JobApplication.builder()
                .companyName(request.getCompanyName())
                .position(request.getPosition())
                .status(request.getStatus())
                .appliedDate(request.getAppliedDate())
                .jobLink(request.getJobLink())
                .location(request.getLocation())
                .notes(request.getNotes())
                .user(user)
                .build();

        return toResponse(applicationRepository.save(application));
    }

    public PageResponse<JobApplicationResponse> list(String userEmail, ApplicationStatus status,
                                                       String search, Pageable pageable) {
        User user = getUser(userEmail);
        Page<JobApplication> page = applicationRepository.search(user.getId(), status, search, pageable);

        return PageResponse.<JobApplicationResponse>builder()
                .content(page.getContent().stream().map(this::toResponse).toList())
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    public JobApplicationResponse getById(String userEmail, Long id) {
        JobApplication application = getOwnedApplication(userEmail, id);
        return toResponse(application);
    }

    @Transactional
    public JobApplicationResponse update(String userEmail, Long id, JobApplicationRequest request) {
        JobApplication application = getOwnedApplication(userEmail, id);

        application.setCompanyName(request.getCompanyName());
        application.setPosition(request.getPosition());
        application.setStatus(request.getStatus());
        application.setAppliedDate(request.getAppliedDate());
        application.setJobLink(request.getJobLink());
        application.setLocation(request.getLocation());
        application.setNotes(request.getNotes());

        return toResponse(applicationRepository.save(application));
    }

    @Transactional
    public void delete(String userEmail, Long id) {
        JobApplication application = getOwnedApplication(userEmail, id);
        applicationRepository.delete(application);
    }

    public DashboardStatsResponse getDashboardStats(String userEmail) {
        User user = getUser(userEmail);

        Map<String, Long> countByStatus = new LinkedHashMap<>();
        for (ApplicationStatus status : ApplicationStatus.values()) {
            countByStatus.put(status.name(), applicationRepository.countByUserIdAndStatus(user.getId(), status));
        }

        return DashboardStatsResponse.builder()
                .totalApplications(applicationRepository.countByUserId(user.getId()))
                .countByStatus(countByStatus)
                .build();
    }

    private JobApplication getOwnedApplication(String userEmail, Long id) {
        User user = getUser(userEmail);
        JobApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));

        if (!application.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Application not found with id: " + id);
        }
        return application;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private JobApplicationResponse toResponse(JobApplication a) {
        return JobApplicationResponse.builder()
                .id(a.getId())
                .companyName(a.getCompanyName())
                .position(a.getPosition())
                .status(a.getStatus())
                .appliedDate(a.getAppliedDate())
                .jobLink(a.getJobLink())
                .location(a.getLocation())
                .notes(a.getNotes())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}
