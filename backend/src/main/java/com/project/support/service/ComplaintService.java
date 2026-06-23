package com.project.support.service;

import com.project.support.entity.Complaint;
import com.project.support.entity.ComplaintStatus;
import com.project.support.repository.ComplaintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;

    @Transactional(readOnly = true)
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    @Transactional
    public Complaint createComplaint(Complaint complaint) {
        return complaintRepository.save(complaint);
    }

    @Transactional
    public Complaint resolveComplaint(Long id, String solution) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        
        complaint.setSolution(solution);
        complaint.setStatus(ComplaintStatus.RESOLVED);
        return complaintRepository.save(complaint);
    }
}
