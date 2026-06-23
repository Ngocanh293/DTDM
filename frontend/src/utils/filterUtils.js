/**
 * Utility to extract technical specifications from product names using Regex.
 * Tailored for PC Components (VGA, RAM, SSD, CPU).
 */

export const extractSpecs = (name, categoryName = '') => {
  const specs = {};
  const upperName = name.toUpperCase();
  const cat = categoryName.toUpperCase();

  // 1. Thương hiệu (Common across all)
  const brands = ['ASUS', 'MSI', 'GIGABYTE', 'ZOTAC', 'GALAX', 'COLORFUL', 'PALIT', 'SAPPHIRE', 'ASROCK', 'PNY', 'LEADTEK', 'SAMSUNG', 'KINGSTON', 'ADATA', 'WESTERN DIGITAL', 'WD', 'SEAGATE', 'LEXAR', 'CRUCIAL', 'CORSAIR', 'TEAMGROUP', 'PATRIOT', 'APACER', 'GEIL', 'SILICON POWER', 'HIKSEMI', 'INTEL', 'AMD'];
  const foundBrand = brands.find(b => upperName.includes(b));
  if (foundBrand) specs['Thương hiệu'] = foundBrand;

  // 2. VGA Specifics
  if (cat.includes('VGA') || upperName.includes('VGA') || upperName.includes('GRAPHICS')) {
    // VRAM: 2GB, 8GB, 12GB...
    const vramMatch = upperName.match(/(\d+)\s*GB/);
    if (vramMatch) specs['Bộ nhớ (VRAM)'] = vramMatch[0];

    // GPU Brand
    if (upperName.includes('NVIDIA') || upperName.includes('GEFORCE') || upperName.includes('RTX') || upperName.includes('GTX')) {
        specs['Hãng GPU'] = 'NVIDIA';
        const seriesMatch = upperName.match(/RTX\s*(\d{2,4})/);
        if (seriesMatch) specs['NVIDIA'] = `RTX ${seriesMatch[1].substring(0, 2)} Series`;
    } else if (upperName.includes('AMD') || upperName.includes('RADEON') || upperName.includes('RX')) {
        specs['Hãng GPU'] = 'AMD';
        const seriesMatch = upperName.match(/RX\s*(\d{4})/);
        if (seriesMatch) specs['AMD'] = `RX ${seriesMatch[1].charAt(0)}000 Series`;
    }
  }

  // 3. RAM Specifics
  if (cat.includes('RAM') || upperName.includes('RAM') || upperName.includes('DESKTOP MEMORY')) {
    // Loại RAM
    if (upperName.includes('DDR4')) specs['Loại RAM'] = 'DDR4';
    else if (upperName.includes('DDR5')) specs['Loại RAM'] = 'DDR5';
    else if (upperName.includes('DDR3')) specs['Loại RAM'] = 'DDR3';

    // Dung lượng RAM
    const capMatch = upperName.match(/(\d+)\s*GB/);
    if (capMatch) specs['Dung lượng'] = capMatch[0];

    // Bus
    const busMatch = upperName.match(/(\d+)\s*MHZ/);
    if (busMatch) specs['Bus'] = busMatch[0];

    // Số thanh
    if (upperName.includes('2X') || upperName.includes('KIT 2')) specs['Số thanh'] = '2 thanh';
    else specs['Số thanh'] = '1 thanh';
  }

  // 4. SSD/HDD Specifics
  if (cat.includes('SSD') || cat.includes('HDD') || upperName.includes('SSD') || upperName.includes('Ổ CỨNG')) {
    // Dung lượng
    const capMatch = upperName.match(/(\d+)\s*(GB|TB)/);
    if (capMatch) specs['Dung lượng'] = capMatch[0];

    // Chuẩn giao tiếp
    if (upperName.includes('NVME') || upperName.includes('M.2')) specs['Chuẩn giao tiếp'] = 'M.2 NVMe PCIe';
    else if (upperName.includes('SATA')) specs['Chuẩn giao tiếp'] = 'SATA III';

    // Thế hệ PCIe
    if (upperName.includes('GEN3') || upperName.includes('3.0')) specs['Thế hệ PCIe'] = 'Gen 3x4';
    else if (upperName.includes('GEN4') || upperName.includes('4.0')) specs['Thế hệ PCIe'] = 'Gen 4x4';
    else if (upperName.includes('GEN5') || upperName.includes('5.0')) specs['Thế hệ PCIe'] = 'Gen 5x4';

    // Form Factor
    if (upperName.includes('2280')) specs['Kích thước ổ cứng'] = 'M.2 2280';
    else if (upperName.includes('2.5')) specs['Kích thước ổ cứng'] = '2.5 Inch';
  }

  // 5. CPU Specifics
  if (cat.includes('CPU') || upperName.includes('BỘ VI XỬ LÝ')) {
     if (upperName.includes('INTEL') || upperName.includes('CORE')) {
        const coreMatch = upperName.match(/I([3579])/);
        if (coreMatch) specs['Dòng CPU'] = `Core i${coreMatch[1]}`;
     } else if (upperName.includes('AMD') || upperName.includes('RYZEN')) {
        const ryzenMatch = upperName.match(/RYZEN\s*([3579])/);
        if (ryzenMatch) specs['Dòng CPU'] = `AMD Ryzen ${ryzenMatch[1]}`;
     }
  }

  // 6. Monitor Specifics
  if (cat.includes('MÀN HÌNH') || upperName.includes('MONITOR')) {
    // Resolution
    if (upperName.includes('4K') || upperName.includes('2160P')) specs['Độ phân giải'] = '4K UHD';
    else if (upperName.includes('2K') || upperName.includes('QHD') || upperName.includes('1440P')) specs['Độ phân giải'] = '2K QHD';
    else if (upperName.includes('FHD') || upperName.includes('1080P')) specs['Độ phân giải'] = 'Full HD';

    // Refresh Rate
    const hzMatch = upperName.match(/(\d+)\s*HZ/);
    if (hzMatch) specs['Tần số quét'] = hzMatch[0];

    // Panel
    if (upperName.includes('IPS')) specs['Tấm nền'] = 'IPS';
    else if (upperName.includes('VA')) specs['Tấm nền'] = 'VA';
    else if (upperName.includes('TN')) specs['Tấm nền'] = 'TN';
    else if (upperName.includes('OLED')) specs['Tấm nền'] = 'OLED';
  }

  // 7. Gear Specifics (Keyboard/Mouse/Headset)
  if (cat.includes('PHÍM') || cat.includes('CHUỘT') || cat.includes('TAI NGHE') || upperName.includes('KEYBOARD') || upperName.includes('MOUSE') || upperName.includes('HEADSET')) {
    if (upperName.includes('WIRELESS') || upperName.includes('KHÔNG DÂY') || upperName.includes('BLUETOOTH')) specs['Kết nối'] = 'Không dây';
    else specs['Kết nối'] = 'Có dây';

    if (upperName.includes('MECHANICAL') || upperName.includes('PHÍM CƠ') || upperName.includes('HOT-SWAP')) specs['Loại'] = 'Cơ (Mechanical)';
  }

  // 8. Laptop Specifics
  if (cat.includes('LAPTOP') || upperName.includes('MACBOOK')) {
    if (upperName.includes('GAMING')) specs['Dòng Laptop'] = 'Gaming';
    else if (upperName.includes('MACBOOK')) specs['Dòng Laptop'] = 'Macbook';
    else specs['Dòng Laptop'] = 'Văn phòng';
  }

  return specs;
};

/**
 * Collect all available unique spec values from a list of products.
 */
export const collectAvailableFilters = (products, categoryName) => {
    const available = {};
    products.forEach(p => {
        const pSpecs = extractSpecs(p.name, categoryName);
        Object.keys(pSpecs).forEach(key => {
            if (!available[key]) available[key] = new Set();
            available[key].add(pSpecs[key]);
        });
    });
    
    // Convert sets to sorted arrays
    const result = {};
    Object.keys(available).forEach(key => {
        result[key] = Array.from(available[key]).sort();
    });
    return result;
};
