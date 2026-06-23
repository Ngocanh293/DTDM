package com.project.user.repository;

import com.project.auth.entity.User;
import com.project.user.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {

    // Lấy danh sách địa chỉ của một user (Mặc định lọc is_deleted = false)
    List<Address> findByUser(User user);

    // Kiểm tra trùng lặp
    boolean existsByUserAndStreetAndCityAndDistrict(User user, String street, String city, String district);

    // Tối ưu N+1 Query: Tắt cờ mặc định của tất cả địa chỉ xuống bằng một lệnh duy nhất O(1)
    @Modifying
    @Query("UPDATE Address a SET a.isDefault = false WHERE a.user = :user AND a.isDefault = true")
    void clearDefaultAddressesForUser(@Param("user") User user);

    // Tìm kiếm địa chỉ bất kể trạng thái xóa (Dùng cho Admin khôi phục)
    @Query(value = "SELECT * FROM addresses WHERE id = :id", nativeQuery = true)
    Optional<Address> findByIdIncludingDeleted(@Param("id") Long id);
}
