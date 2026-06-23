package com.project.common.config;

import com.project.auth.entity.User;
import com.project.auth.entity.UserRole;
import com.project.auth.entity.UserStatus;
import com.project.auth.repository.UserRepository;
import com.project.product.entity.Category;
import com.project.product.entity.Product;
import com.project.product.repository.CategoryRepository;
import com.project.product.repository.ProductRepository;
import com.project.support.repository.ComplaintRepository;
import com.project.user.entity.UserProfile;
import com.project.user.repository.UserProfileRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@Order(1)
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(CategoryRepository categoryRepository,
                           ComplaintRepository complaintRepository,
                           UserRepository userRepository,
                           UserProfileRepository userProfileRepository,
                           ProductRepository productRepository,
                           PasswordEncoder passwordEncoder) {
        this.categoryRepository = categoryRepository;
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.productRepository = productRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedCategories();
        seedProducts();
        seedComplaints();
        seedAdminAccount();
    }

    private void seedCategories() {
        List<String> defaultCategoryNames = List.of(
                "Laptop Gaming",
                "CPU",
                "Mainboard",
                "RAM",
                "VGA",
                "SSD",
                "HDD",
                "Nguồn",
                "Case",
                "Tản nhiệt",
                "Màn hình",
                "Laptop",
                "PC",
                "Bàn phím",
                "Chuột",
                "Tai nghe",
                "Loa",
                "Ghế",
                "Console",
                "Phụ kiện",
                "Thiết bị VP",
                "Sạc DP"
        );

        for (String name : defaultCategoryNames) {
            if (!categoryRepository.existsByName(name)) {
                categoryRepository.save(new Category(null, name));
            }
        }
    }

    private void seedProducts() {
        List<SeedProduct> products = List.of(
                p("Intel Core i5-12400F", "CPU 6 nhân 12 luồng, boost 4.4GHz, phù hợp PC gaming tầm trung.", "3290000", "Intel", "CPU", "/category-images/cpu.png"),
                p("Intel Core i7-14700K", "CPU 20 nhân 28 luồng, boost 5.6GHz, mạnh cho game và dựng nội dung.", "10990000", "Intel", "CPU", "/category-images/cpu.png"),
                p("Intel Core i9-14900K", "CPU 24 nhân 32 luồng, hiệu năng cao cho workstation và livestream.", "14590000", "Intel", "CPU", "/category-images/cpu.png"),
                p("AMD Ryzen 5 7600", "CPU 6 nhân 12 luồng, nền tảng AM5, tiết kiệm điện và chơi game tốt.", "4990000", "AMD", "CPU", "/category-images/cpu.png"),
                p("AMD Ryzen 7 7800X3D", "CPU 8 nhân 16 luồng, 3D V-Cache, tối ưu FPS cho game thủ.", "9690000", "AMD", "CPU", "/category-images/cpu.png"),

                p("ASUS TUF Gaming B760M-Plus WiFi", "Mainboard Intel B760, DDR5, WiFi 6, đủ cổng cho cấu hình gaming.", "4290000", "ASUS", "Mainboard", "/category-images/mainboard.png"),
                p("MSI MAG B650 Tomahawk WiFi", "Mainboard AM5, DDR5, VRM tốt, hỗ trợ Ryzen 7000/8000/9000.", "5290000", "MSI", "Mainboard", "/category-images/mainboard.png"),
                p("Gigabyte Z790 Aorus Elite AX", "Mainboard Z790, DDR5, PCIe 5.0, WiFi 6E cho cấu hình Intel cao cấp.", "6790000", "Gigabyte", "Mainboard", "/category-images/mainboard.png"),
                p("ASRock B550M Steel Legend", "Mainboard AM4, DDR4, M.2 NVMe, lựa chọn tốt cho Ryzen phổ thông.", "2790000", "ASRock", "Mainboard", "/category-images/mainboard.png"),

                p("Kingston Fury Beast 16GB DDR4 3200", "RAM 16GB DDR4 bus 3200MHz, ổn định cho PC văn phòng và gaming.", "890000", "Kingston", "RAM", "/category-images/ram.png"),
                p("Corsair Vengeance LPX 32GB DDR4 3600", "RAM 2x16GB DDR4 bus 3600MHz, tản nhiệt nhôm, chạy đa nhiệm tốt.", "1890000", "Corsair", "RAM", "/category-images/ram.png"),
                p("G.Skill Trident Z5 RGB 32GB DDR5 6000", "RAM 2x16GB DDR5 bus 6000MHz, LED RGB, hợp cấu hình cao cấp.", "3290000", "G.Skill", "RAM", "/category-images/ram.png"),
                p("TeamGroup T-Force Delta RGB 32GB DDR5", "RAM DDR5 32GB, bus 6000MHz, thiết kế RGB nổi bật.", "2990000", "TeamGroup", "RAM", "/category-images/ram.png"),

                p("ASUS Dual RTX 4060 OC 8GB", "VGA RTX 4060 8GB GDDR6, hỗ trợ DLSS 3, chơi tốt Full HD.", "8290000", "ASUS", "VGA", "/category-images/vga.png"),
                p("Gigabyte RTX 4070 Super Windforce 12GB", "VGA RTX 4070 Super 12GB, phù hợp gaming 2K và đồ họa.", "17990000", "Gigabyte", "VGA", "/category-images/vga.png"),
                p("MSI RTX 5070 Gaming Trio 12GB", "VGA RTX 5070 12GB, tản 3 fan, hiệu năng mạnh cho game mới.", "22990000", "MSI", "VGA", "/category-images/vga.png"),
                p("Sapphire Radeon RX 7800 XT Pulse 16GB", "VGA AMD RX 7800 XT 16GB, hiệu năng 2K tốt, VRAM rộng.", "13990000", "Sapphire", "VGA", "/category-images/vga.png"),
                p("ASUS ROG Strix RTX 5090 OC 32GB", "VGA RTX 5090 32GB, dành cho gaming 4K, AI và render nặng.", "78990000", "ASUS", "VGA", "/category-images/vga.png"),

                p("Samsung 990 EVO Plus 1TB", "SSD M.2 NVMe 1TB, tốc độ đọc cao, phù hợp cài Windows và game.", "2390000", "Samsung", "SSD", "/category-images/storage.png"),
                p("WD Black SN850X 2TB", "SSD NVMe 2TB, tốc độ cao cho game, dựng phim và file lớn.", "4290000", "Western Digital", "SSD", "/category-images/storage.png"),
                p("Kingston NV3 500GB", "SSD NVMe 500GB, lựa chọn tiết kiệm cho máy văn phòng.", "890000", "Kingston", "SSD", "/category-images/storage.png"),
                p("Crucial P3 Plus 1TB", "SSD PCIe Gen4 1TB, giá tốt, tốc độ ổn cho nhu cầu phổ thông.", "1890000", "Crucial", "SSD", "/category-images/storage.png"),

                p("Seagate Barracuda 2TB", "HDD 3.5 inch 2TB, 7200RPM, lưu trữ dữ liệu và game dung lượng lớn.", "1490000", "Seagate", "HDD", "/category-images/storage.png"),
                p("WD Blue 4TB", "HDD 4TB, hoạt động ổn định cho lưu ảnh, video và backup.", "2690000", "Western Digital", "HDD", "/category-images/storage.png"),
                p("Toshiba P300 1TB", "HDD 1TB, 7200RPM, phù hợp PC văn phòng và máy học tập.", "990000", "Toshiba", "HDD", "/category-images/storage.png"),

                p("Corsair RM750e 750W Gold", "Nguồn 750W 80 Plus Gold, full modular, phù hợp RTX 4060/4070.", "2590000", "Corsair", "Nguồn", "/category-images/psu.png"),
                p("Cooler Master MWE 850 Gold V2", "Nguồn 850W 80 Plus Gold, cáp đen, ổn định cho PC gaming.", "2990000", "Cooler Master", "Nguồn", "/category-images/psu.png"),
                p("MSI MAG A650BN 650W Bronze", "Nguồn 650W 80 Plus Bronze, giá tốt cho cấu hình phổ thông.", "1290000", "MSI", "Nguồn", "/category-images/psu.png"),

                p("NZXT H5 Flow Black", "Case mid tower, mặt trước thoáng khí, hỗ trợ tản nhiệt nước 280mm.", "2390000", "NZXT", "Case", "/category-images/case.png"),
                p("Lian Li Lancool 216 RGB", "Case airflow tốt, sẵn fan RGB lớn, dễ đi dây và lắp PC gaming.", "2690000", "Lian Li", "Case", "/category-images/case.png"),
                p("Xigmatek Aqua M Ultra", "Case kính cường lực, thiết kế gọn, hợp cấu hình LED RGB.", "1190000", "Xigmatek", "Case", "/category-images/case.png"),

                p("DeepCool AK400 Digital", "Tản khí 1 tháp, màn hiển thị nhiệt độ, phù hợp CPU i5/R5.", "990000", "DeepCool", "Tản nhiệt", "/category-images/cooler.png"),
                p("Thermalright Peerless Assassin 120 SE", "Tản khí 2 tháp, 2 fan 120mm, hiệu năng cao trong tầm giá.", "1190000", "Thermalright", "Tản nhiệt", "/category-images/cooler.png"),
                p("Corsair iCUE H150i Elite 360", "Tản nước AIO 360mm, LED RGB, phù hợp CPU cao cấp.", "4590000", "Corsair", "Tản nhiệt", "/category-images/cooler.png"),

                p("LG UltraGear 27GS60F-B 27 inch", "Màn hình gaming 27 inch, Full HD, 180Hz, IPS, 1ms.", "3990000", "LG", "Màn hình", "/category-images/monitor.png"),
                p("Dell UltraSharp U2723QE 27 inch", "Màn hình 4K IPS Black, USB-C, màu sắc tốt cho thiết kế.", "15500000", "Dell", "Màn hình", "/category-images/monitor.png"),
                p("ASUS TUF VG27AQ3A 27 inch", "Màn hình 2K, 180Hz, Fast IPS, FreeSync Premium.", "5890000", "ASUS", "Màn hình", "/category-images/monitor.png"),
                p("ViewSonic VX2479A-HD-PRO 24 inch", "Màn hình 24 inch, Full HD, 240Hz, phù hợp eSport.", "2890000", "ViewSonic", "Màn hình", "/category-images/monitor.png"),

                p("ASUS ROG Zephyrus G14 2025", "Laptop gaming 14 inch OLED, Ryzen AI 9, RTX 5060, RAM 32GB, SSD 1TB.", "48990000", "ASUS", "Laptop Gaming", "/category-images/laptop.png"),
                p("Acer Nitro ProPanel AN16S", "Laptop gaming 16 inch, Core i7, RTX 5060, RAM 16GB, SSD 512GB.", "40990000", "Acer", "Laptop Gaming", "/category-images/laptop.png"),
                p("Lenovo LOQ 15IRX10", "Laptop gaming 15.6 inch, Core i7, RTX 5050, RAM 16GB, SSD 512GB.", "37368000", "Lenovo", "Laptop Gaming", "/category-images/laptop.png"),
                p("MSI Katana 15 HX", "Laptop gaming 15.6 inch, Core i5 HX, RTX 4060, màn 144Hz.", "28990000", "MSI", "Laptop Gaming", "/category-images/laptop.png"),
                p("Gigabyte G6 MF", "Laptop gaming 16 inch, Core i5, RTX 4050, RAM 16GB, SSD 512GB.", "24990000", "Gigabyte", "Laptop Gaming", "/category-images/laptop.png"),

                p("ASUS ExpertBook P1403CVA", "Laptop văn phòng 14 inch, Core i5, RAM 16GB, SSD 512GB, nhẹ 1.4kg.", "25990000", "ASUS", "Laptop", "/category-images/laptop.png"),
                p("Acer Aspire Lite 15", "Laptop 15.6 inch, Ryzen 5, RAM 16GB, SSD 512GB, màn Full HD.", "15990000", "Acer", "Laptop", "/category-images/laptop.png"),
                p("MSI Prestige 13 AI Evo", "Laptop mỏng nhẹ 13.3 inch OLED, Ultra 7, RAM 32GB, SSD 1TB.", "32990000", "MSI", "Laptop", "/category-images/laptop.png"),
                p("Dell Inspiron 14 5440", "Laptop 14 inch, Core 5, RAM 16GB, SSD 512GB, pin tốt cho học tập.", "18490000", "Dell", "Laptop", "/category-images/laptop.png"),
                p("MacBook Air 13 M3", "Laptop Apple M3, RAM 8GB, SSD 256GB, pin dài và màn Retina.", "24990000", "Apple", "Laptop", "/category-images/laptop.png"),

                p("PC PCESTORE i3 RTX 5050", "PC gaming Core i3-12100F, RTX 5050, RAM 8GB, SSD 256GB.", "17990000", "PCESTORE", "PC", "/category-images/pc.png"),
                p("PC PCESTORE i5 RTX 5060", "PC gaming Core i5-12400F, RTX 5060, RAM 16GB, SSD 512GB.", "24990000", "PCESTORE", "PC", "/category-images/pc.png"),
                p("PC PCESTORE i7 RTX 5070", "PC gaming Core i7, RTX 5070, RAM 32GB, SSD 1TB, nguồn 850W.", "39990000", "PCESTORE", "PC", "/category-images/pc.png"),
                p("PC PCESTORE Ryzen 5 RX 7800 XT", "PC Ryzen 5 7600, RX 7800 XT, RAM 32GB DDR5, SSD 1TB.", "32990000", "PCESTORE", "PC", "/category-images/pc.png"),
                p("PC Workstation Creator Ultra", "PC dựng phim Core i9, RTX 5090, RAM 64GB, SSD 2TB.", "89990000", "PCESTORE", "PC", "/category-images/pc.png"),

                p("Razer BlackWidow V4 Pro", "Bàn phím cơ fullsize, switch Razer, RGB, kê tay nam châm.", "5500000", "Razer", "Bàn phím", "/category-images/keyboard.png"),
                p("Keychron K2 V2 Hot-swap", "Bàn phím cơ 75%, không dây Bluetooth, hot-swap, dùng Mac/Windows.", "2200000", "Keychron", "Bàn phím", "/category-images/keyboard.png"),
                p("Akko 5075B Plus Dracula Castle", "Bàn phím cơ 75%, switch Akko, kết nối 3 mode, keycap PBT.", "1890000", "Akko", "Bàn phím", "/category-images/keyboard.png"),
                p("Logitech G Pro X TKL Lightspeed", "Bàn phím TKL không dây, switch GX, pin tốt cho eSport.", "3890000", "Logitech", "Bàn phím", "/category-images/keyboard.png"),

                p("Logitech G Pro X Superlight 2", "Chuột gaming không dây 60g, cảm biến HERO 2, polling 2K.", "3400000", "Logitech", "Chuột", "/category-images/mouse.png"),
                p("Razer DeathAdder V3 Pro", "Chuột gaming ergonomic, cảm biến Focus Pro 30K, siêu nhẹ.", "3200000", "Razer", "Chuột", "/category-images/mouse.png"),
                p("Corsair M75 Wireless", "Chuột không dây đối xứng, cảm biến 26K DPI, pin bền.", "2490000", "Corsair", "Chuột", "/category-images/mouse.png"),
                p("Rapoo VT9 Pro", "Chuột gaming không dây, trọng lượng nhẹ, DPI cao, giá dễ tiếp cận.", "1090000", "Rapoo", "Chuột", "/category-images/mouse.png"),

                p("SteelSeries Arctis Nova Pro Wireless", "Tai nghe gaming không dây, DAC rời, âm thanh Hi-Res.", "8500000", "SteelSeries", "Tai nghe", "/category-images/headset.png"),
                p("Sony WH-1000XM5", "Tai nghe Bluetooth chống ồn chủ động, pin 30 giờ, âm thanh chi tiết.", "7500000", "Sony", "Tai nghe", "/category-images/headset.png"),
                p("HyperX Cloud III Wireless", "Tai nghe gaming không dây, driver 53mm, pin dài, mic rõ.", "3290000", "HyperX", "Tai nghe", "/category-images/headset.png"),
                p("Logitech G Pro X 2 Lightspeed", "Tai nghe gaming không dây, graphene driver, hỗ trợ Blue VO!CE.", "4490000", "Logitech", "Tai nghe", "/category-images/headset.png"),

                p("Edifier MR4 Studio Monitor", "Loa kiểm âm 2.0, công suất 42W, âm thanh cân bằng.", "2190000", "Edifier", "Loa", "/category-images/speaker.png"),
                p("JBL Go 4 Bluetooth", "Loa Bluetooth nhỏ gọn, chống nước IP67, pin khoảng 7 giờ.", "990000", "JBL", "Loa", "/category-images/speaker.png"),
                p("Logitech Z407 Bluetooth", "Loa 2.1, subwoofer rời, điều khiển không dây, hợp bàn làm việc.", "2290000", "Logitech", "Loa", "/category-images/speaker.png"),

                p("E-Dra EGC226 Gaming Chair", "Ghế gaming khung thép, ngả lưng, tay ghế 2D, đệm êm.", "2890000", "E-Dra", "Ghế", "/category-images/chair.png"),
                p("Warrior Raider Series WGC206", "Ghế gaming lưng cao, da PU, có gối cổ và gối lưng.", "2390000", "Warrior", "Ghế", "/category-images/chair.png"),
                p("Corsair TC100 Relaxed", "Ghế gaming dáng rộng, đệm thoải mái, ngả 160 độ.", "4990000", "Corsair", "Ghế", "/category-images/chair.png"),

                p("Sony PlayStation 5 Slim", "Console PS5 Slim, SSD 1TB, tay cầm DualSense, chơi game 4K.", "13990000", "Sony", "Console", "/category-images/console.png"),
                p("Xbox Series S 512GB", "Console nhỏ gọn, chơi game Game Pass, độ phân giải tối đa 1440p.", "7490000", "Microsoft", "Console", "/category-images/console.png"),
                p("Nintendo Switch OLED", "Console lai cầm tay, màn OLED 7 inch, dock TV, Joy-Con rời.", "7990000", "Nintendo", "Console", "/category-images/console.png"),

                p("Ugreen USB-C Hub 10 in 1", "Hub USB-C hỗ trợ HDMI, LAN, USB 3.0, đọc thẻ, sạc PD 100W.", "1290000", "Ugreen", "Phụ kiện", "/category-images/accessory.png"),
                p("Baseus DisplayPort 1.4 Cable 2m", "Cáp DP 1.4 hỗ trợ 4K 144Hz, 2K 240Hz, đầu mạ bền.", "290000", "Baseus", "Phụ kiện", "/category-images/accessory.png"),
                p("Logitech C920s Webcam", "Webcam Full HD 1080p, mic kép, có nắp che riêng tư.", "1690000", "Logitech", "Phụ kiện", "/category-images/accessory.png"),

                p("HP LaserJet M211dw", "Máy in laser đen trắng, WiFi, in 2 mặt tự động, hợp văn phòng nhỏ.", "3290000", "HP", "Thiết bị VP", "/category-images/office-device.png"),
                p("Canon LBP 2900 Plus", "Máy in laser phổ thông, bền, dễ dùng cho học tập và văn phòng.", "3490000", "Canon", "Thiết bị VP", "/category-images/office-device.png"),
                p("Epson EcoTank L3250", "Máy in phun màu đa năng, WiFi, mực tiết kiệm.", "3990000", "Epson", "Thiết bị VP", "/category-images/office-device.png"),

                p("Anker PowerPort III 65W", "Củ sạc USB-C 65W, hỗ trợ laptop mỏng nhẹ và điện thoại.", "790000", "Anker", "Sạc DP", "/category-images/charger.png"),
                p("Ugreen Nexode 100W GaN", "Củ sạc GaN 100W, 4 cổng, sạc laptop và nhiều thiết bị cùng lúc.", "1490000", "Ugreen", "Sạc DP", "/category-images/charger.png"),
                p("Baseus USB-C to USB-C 100W 2m", "Cáp sạc USB-C 100W, dài 2m, truyền dữ liệu ổn định.", "220000", "Baseus", "Sạc DP", "/category-images/charger.png")
        );

        for (SeedProduct product : products) {
            saveProduct(product);
        }
    }

    private void saveProduct(SeedProduct seed) {
        if (productRepository.existsByNameIgnoreCase(seed.name())) {
            return;
        }

        Category category = categoryRepository.findByName(seed.categoryName())
                .orElseGet(() -> categoryRepository.save(new Category(null, seed.categoryName())));

        Product product = Product.builder()
                .name(seed.name())
                .description(seed.description())
                .price(new BigDecimal(seed.price()))
                .brand(seed.brand())
                .category(category)
                .imageUrl(seed.imageUrl())
                .build();

        productRepository.save(product);
    }

    private void seedComplaints() {
        if (complaintRepository.count() == 0) {
            complaintRepository.save(new com.project.support.entity.Complaint(1L, "Nguyễn Văn An", "Lỗi VGA bị crash"));
            complaintRepository.save(new com.project.support.entity.Complaint(2L, "Trần Thị Bé", "Giao hàng chậm 2 ngày"));
        }
    }

    private void seedAdminAccount() {
        String adminEmail = "admin@pcestore.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User(
                    adminEmail,
                    passwordEncoder.encode("Admin@123"),
                    UserRole.ADMIN,
                    UserStatus.ACTIVE);
            admin.setFullName("System Administrator");
            User savedAdmin = userRepository.save(admin);

            UserProfile profile = new UserProfile(savedAdmin, "System Administrator", null, null);
            userProfileRepository.save(profile);
        }
    }

    private static SeedProduct p(String name, String description, String price, String brand, String categoryName, String imageUrl) {
        return new SeedProduct(name, description, price, brand, categoryName, imageUrl);
    }

    private record SeedProduct(
            String name,
            String description,
            String price,
            String brand,
            String categoryName,
            String imageUrl
    ) {
    }
}
