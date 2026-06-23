package com.project.user.service;

import com.project.auth.entity.User;
import com.project.user.dto.AddressRequest;
import com.project.user.dto.AddressResponse;
import com.project.user.entity.Address;
import com.project.user.repository.AddressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import java.sql.SQLException;

import java.util.List;

@Service
public class AddressService {

    private static final String ADDRESS_NOT_FOUND_MSG = "error.address.not_found";
    private static final int MAX_ADDRESSES_PER_USER = 10;
    private static final String AUDIT_ADDRESS_ADDED = "Address added: ";
    private static final String AUDIT_ADDRESS_UPDATED = "Address updated, ID: ";
    private static final String AUDIT_ADDRESS_DEFAULT = "Default address set, ID: ";
    private static final String AUDIT_ADDRESS_DELETED = "Address deleted, ID: ";

    private final AddressRepository addressRepository;
    private final com.project.user.repository.UserAuditLogRepository auditLogRepository;

    public AddressService(AddressRepository addressRepository, com.project.user.repository.UserAuditLogRepository auditLogRepository) {
        this.addressRepository = addressRepository;
        this.auditLogRepository = auditLogRepository;
    }

    // Lấy toàn bộ địa chỉ của một User
    @Retryable(retryFor = {SQLException.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public List<AddressResponse> getUserAddresses(User user) {
        return addressRepository.findByUser(user).stream()
                .map(addr -> new AddressResponse(
                        addr.getId(),
                        addr.getStreet(),
                        addr.getCity(),
                        addr.getDistrict(),
                        addr.getIsDefault()
                )).toList();
    }

    // Thêm địa chỉ mới
    @Transactional
    @Retryable(retryFor = {SQLException.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public AddressResponse addAddress(User user, AddressRequest request) {
        // Càn quét chống rác DB 
        if (addressRepository.existsByUserAndStreetAndCityAndDistrict(
                user, request.getStreet(), request.getCity(), request.getDistrict())) {
            throw new IllegalArgumentException("error.address.duplicate");
        }

        List<Address> existingAddresses = addressRepository.findByUser(user);

        // Giới hạn tối đa số địa chỉ cho mỗi user
        if (existingAddresses.size() >= MAX_ADDRESSES_PER_USER) {
            throw new IllegalArgumentException("error.address.limit_exceeded");
        }

        // Nếu đây là địa chỉ đầu tiên, tự động set làm mặc định bất chấp cờ
        boolean isDefault = Boolean.TRUE.equals(request.getIsDefault());
        
        if (existingAddresses.isEmpty()) {
            isDefault = true;
        } else if (isDefault) {
            // Nếu đánh set là mặc định, phải huỷ mặc định của tất cả địa chỉ cũ
            addressRepository.clearDefaultAddressesForUser(user);
        }

        Address newAddr = new Address(
                user,
                request.getStreet(),
                request.getCity(),
                request.getDistrict(),
                isDefault
        );

        addressRepository.save(newAddr);

        // Log hành động
        auditLogRepository.save(new com.project.user.entity.UserAuditLog(user, com.project.user.entity.UserAction.ADD_ADDRESS,
            AUDIT_ADDRESS_ADDED + newAddr.getStreet(), null));

        return new AddressResponse(
                newAddr.getId(),
                newAddr.getStreet(),
                newAddr.getCity(),
                newAddr.getDistrict(),
                newAddr.getIsDefault()
        );
    }

    // Sửa chữa, cập nhật chỉnh tả và vị trí của một địa chỉ cũ
    @Transactional
    @Retryable(retryFor = {SQLException.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public AddressResponse updateAddress(User user, Long addressId, AddressRequest request) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException(ADDRESS_NOT_FOUND_MSG));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("error.address.denied_edit");
        }

        // Check Duplicate nếu chuỗi bị thay đổi sang nhà hàng xóm
        boolean isChanged = !address.getStreet().equals(request.getStreet()) || 
                            !address.getCity().equals(request.getCity()) || 
                            !address.getDistrict().equals(request.getDistrict());
        
        if (isChanged && addressRepository.existsByUserAndStreetAndCityAndDistrict(
                user, request.getStreet(), request.getCity(), request.getDistrict())) {
            throw new IllegalArgumentException("error.address.duplicate");
        }

        address.setStreet(request.getStreet());
        address.setCity(request.getCity());
        address.setDistrict(request.getDistrict());

        // Cơ chế lật cờ
        boolean shouldBeDefault = Boolean.TRUE.equals(request.getIsDefault());
        
        if (shouldBeDefault && !Boolean.TRUE.equals(address.getIsDefault())) {
            addressRepository.clearDefaultAddressesForUser(user);
            address.setIsDefault(true);
        } else if (!shouldBeDefault && Boolean.TRUE.equals(address.getIsDefault())) {
            address.setIsDefault(false);
        }

        addressRepository.save(address);

        // Log hành động
        auditLogRepository.save(new com.project.user.entity.UserAuditLog(user, com.project.user.entity.UserAction.UPDATE_ADDRESS,
            AUDIT_ADDRESS_UPDATED + addressId, null));

        return new AddressResponse(address.getId(), address.getStreet(), address.getCity(), address.getDistrict(), address.getIsDefault());
    }

    // Lật cờ mặc định nhanh chóng bằng mốc ID không cần body JSON
    @Transactional
    @Retryable(retryFor = {SQLException.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public AddressResponse setDefaultAddress(User user, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException(ADDRESS_NOT_FOUND_MSG));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("error.address.denied_change");
        }

        if (Boolean.TRUE.equals(address.getIsDefault())) {
            return new AddressResponse(address.getId(), address.getStreet(), address.getCity(), address.getDistrict(), true);
        }

        // Tắt hết cờ đang chớp cũ
        addressRepository.clearDefaultAddressesForUser(user);

        address.setIsDefault(true);
        addressRepository.save(address);

        // Log hành động
        auditLogRepository.save(new com.project.user.entity.UserAuditLog(user, com.project.user.entity.UserAction.SET_DEFAULT_ADDRESS,
            AUDIT_ADDRESS_DEFAULT + addressId, null));

        return new AddressResponse(address.getId(), address.getStreet(), address.getCity(), address.getDistrict(), true);
    }

    // Xoá địa chỉ (Soft Delete)
    @Transactional
    public void deleteAddress(User user, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException(ADDRESS_NOT_FOUND_MSG));

        // Xác minh xem địa chỉ này có thuộc về user đang tạo req ko
        if (!user.getRole().equals(com.project.auth.entity.UserRole.ADMIN) && 
            !address.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("error.address.denied_delete");
        }

        // Đánh dấu xóa mềm
        address.setDeleted(true);
        addressRepository.save(address);

        // Log hành động
        auditLogRepository.save(new com.project.user.entity.UserAuditLog(user, com.project.user.entity.UserAction.DELETE_ADDRESS,
            AUDIT_ADDRESS_DELETED + addressId, null));
    }

    // Khôi phục địa chỉ (Restore) - Chỉ dành cho Admin hoặc chủ sở hữu
    @Transactional
    public AddressResponse restoreAddress(User user, Long addressId) {
        Address address = addressRepository.findByIdIncludingDeleted(addressId)
                .orElseThrow(() -> new IllegalArgumentException(ADDRESS_NOT_FOUND_MSG));

        // Kiểm tra quyền: Admin hoặc đúng chủ sở hữu
        if (!user.getRole().equals(com.project.auth.entity.UserRole.ADMIN) && 
            !address.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("error.address.denied_restore");
        }

        address.setDeleted(false);
        addressRepository.save(address);

        return new AddressResponse(
                address.getId(),
                address.getStreet(),
                address.getCity(),
                address.getDistrict(),
                address.getIsDefault()
        );
    }
}
