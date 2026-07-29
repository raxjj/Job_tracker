package com.jobtracker.repository;

import com.jobtracker.model.ApplicationStatus;
import com.jobtracker.model.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    @Query("""
           SELECT a FROM JobApplication a
           WHERE a.user.id = :userId
           AND (:status IS NULL OR a.status = :status)
           AND (:search IS NULL OR LOWER(a.companyName) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(a.position) LIKE LOWER(CONCAT('%', :search, '%')))
           ORDER BY a.updatedAt DESC
           """)
    Page<JobApplication> search(@Param("userId") Long userId,
                                 @Param("status") ApplicationStatus status,
                                 @Param("search") String search,
                                 Pageable pageable);

    List<JobApplication> findByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, ApplicationStatus status);

    long countByUserId(Long userId);
}
