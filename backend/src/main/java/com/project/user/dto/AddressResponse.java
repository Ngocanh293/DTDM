package com.project.user.dto;

public class AddressResponse {

    private Long id;
    private String street;
    private String city;
    private String district;
    private Boolean isDefault;

    public AddressResponse() {
    }

    public AddressResponse(Long id, String street, String city, String district, Boolean isDefault) {
        this.id = id;
        this.street = street;
        this.city = city;
        this.district = district;
        this.isDefault = isDefault;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean aDefault) {
        isDefault = aDefault;
    }
}
