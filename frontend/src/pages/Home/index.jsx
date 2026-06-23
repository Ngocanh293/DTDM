import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import apiClient from '../../services/api';
import StoreProductCard from '../../components/StoreProductCard';
import { formatCurrency } from '../../utils';

const promoSlides = [
  { image: '/promo-slide-2.png', alt: 'Nâng đời laptop PCeStore' },
  { image: '/promo-slide-1.png', alt: 'Lenovo Legion RTX 50 PCeStore' },
  { image: '/promo-slide-3.png', alt: 'Kho laptop dưới 9 triệu PCeStore' },
  { image: '/promo-slide-4.png', alt: 'Tuần lễ laptop gaming PCeStore' },
];

const trendTags = [
  'Nổi bật',
  'RTX 5090',
  'RTX 5080',
  'RTX 5070',
  'RTX 5060',
  'Laptop gaming',
  'Màn hình 240Hz',
  'SSD 1TB',
  'Build PC i5',
  'Chuột gaming',
];

const categoryGroups = [
  {
    title: 'PC GAMING - PC DO HOA',
    icon: 'bi-pc-display',
    items: ['PC theo VGA', 'PC theo CPU', 'PC thiet ke dac biet', 'Build PC theo ngan sach'],
  },
  {
    title: 'LINH KIEN MAY TINH',
    icon: 'bi-motherboard',
    items: ['VGA', 'CPU', 'Mainboard', 'RAM', 'SSD', 'Nguon', 'Tan nhiet', 'Case'],
  },
  {
    title: 'LAPTOP - MAN HINH',
    icon: 'bi-laptop',
    items: ['Laptop gaming', 'Laptop văn phòng', 'Màn hình gaming', 'Màn hình đồ họa'],
  },
  {
    title: 'GEAR - PHU KIEN',
    icon: 'bi-keyboard',
    items: ['Bàn phím', 'Chuột gaming', 'Tai nghe', 'Ghế - bàn', 'Thiết bị mạng'],
  },
];

const fallbackCategories = [
  'Laptop',
  'Laptop Gaming',
  'PC GVN',
  'Main, CPU, VGA',
  'Case, Nguon, Tan nhiet',
  'Ổ cứng, RAM, Thẻ nhớ',
  'Loa, Micro, Webcam',
  'Màn hình',
  'Ban phim',
  'Chuot + Lot chuot',
  'Tai nghe',
  'Ghe - Ban',
  'Phan mem, mang',
  'Handheld, Console',
  'Phụ kiện',
];

const productCategoryTiles = [
  ['Laptop', '/category-images/laptop.png'],
  ['PC', '/category-images/pc.png'],
  ['Màn hình', '/category-images/monitor.png'],
  ['Mainboard', '/category-images/mainboard.png'],
  ['CPU', '/category-images/cpu.png'],
  ['VGA', '/category-images/vga.png'],
  ['RAM', '/category-images/ram.png'],
  ['Ổ cứng', '/category-images/storage.png'],
  ['Case', '/category-images/case.png'],
  ['Tản nhiệt', '/category-images/cooler.png'],
  ['Nguồn', '/category-images/psu.png'],
  ['Bàn phím', '/category-images/keyboard.png'],
  ['Chuột', '/category-images/mouse.png'],
  ['Ghế', '/category-images/chair.png'],
  ['Tai nghe', '/category-images/headset.png'],
  ['Loa', '/category-images/speaker.png'],
  ['Console', '/category-images/console.png'],
  ['Phụ kiện', '/category-images/accessory.png'],
  ['Thiết bị VP', '/category-images/office-device.png'],
  ['Sạc DP', '/category-images/charger.png'],
];

const productShowcaseSections = [
  {
    key: 'monitor',
    title: 'Màn hình chính hãng',
    benefit: 'Bảo hành 1 đổi 1',
    icon: 'bi-truck',
    terms: ['màn hình', 'monitor'],
    chips: ['LG', 'ASUS', 'ViewSonic', 'Dell', 'Gigabyte', 'AOC', 'Acer', 'HKC'],
  },
  {
    key: 'gaming-laptop',
    title: 'Laptop gaming hot',
    benefit: 'Miễn phí giao hàng',
    icon: 'bi-truck',
    terms: ['laptop gaming', 'gaming'],
    chips: ['ASUS', 'ACER', 'MSI', 'LENOVO', 'GIGABYTE', 'DELL'],
  },
  {
    key: 'pc',
    title: 'PC hot',
    benefit: 'Trả góp 0%',
    icon: 'bi-truck',
    terms: ['pc', 'máy tính bộ', 'pc gaming'],
    chips: ['PC i3', 'PC i5', 'PC i7', 'PC i9', 'PC R3', 'PC R5', 'PC R7', 'PC R9'],
  },
  {
    key: 'office-laptop',
    title: 'Laptop văn phòng hot',
    benefit: 'Miễn phí giao hàng',
    icon: 'bi-truck',
    terms: ['laptop'],
    exclude: ['gaming'],
    chips: ['ASUS', 'MSI', 'LENOVO', 'DELL', 'LG', 'ACER'],
  },
  {
    key: 'mouse',
    title: 'Chuột hot',
    benefit: 'Giao hàng toàn quốc',
    icon: 'bi-truck',
    terms: ['chuột', 'mouse'],
    chips: ['Logitech', 'Razer', 'Asus', 'Corsair', 'Dare-U', 'Rapoo'],
  },
  {
    key: 'keyboard',
    title: 'Bàn phím hot',
    benefit: 'Giao hàng toàn quốc',
    icon: 'bi-truck',
    terms: ['bàn phím', 'keyboard'],
    chips: ['Akko', 'Asus', 'Razer', 'Logitech', 'Leopold', 'DareU'],
  },
  {
    key: 'components',
    title: 'Linh kiện - phụ kiện nổi bật',
    benefit: 'Đủ đồ build PC',
    icon: 'bi-cpu',
    terms: ['cpu', 'vga', 'ram', 'ssd', 'hdd', 'mainboard', 'nguồn', 'case', 'tản nhiệt', 'phụ kiện'],
    chips: ['CPU', 'VGA', 'RAM', 'SSD', 'Mainboard', 'Nguồn', 'Case', 'Tản nhiệt'],
  },
];

const normalizeCategoryName = (name = '') => (
  name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
);

const getProductSearchText = (product = {}) => (
  normalizeCategoryName(`${product.name || ''} ${product.categoryName || ''} ${product.brand || ''}`)
);

const pickProductsForSection = (products, section) => {
  const terms = section.terms.map(normalizeCategoryName);
  const excluded = (section.exclude || []).map(normalizeCategoryName);

  return products
    .filter(product => {
      const searchText = getProductSearchText(product);
      const matchedTerm = terms.some(term => searchText.includes(term));
      const matchedExclude = excluded.some(term => searchText.includes(term));
      return matchedTerm && !matchedExclude;
    })
    .slice(0, 5);
};

const ProductShowcaseSection = ({ section, onAddToCart }) => {
  const railRef = useRef(null);

  const scrollByCard = (direction = 1) => {
    const rail = railRef.current;
    if (!rail) return;

    const card = rail.querySelector('.store-product-card');
    const distance = card ? card.getBoundingClientRect().width + 10 : 260;
    rail.scrollBy({ left: direction * distance, behavior: 'smooth' });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const rail = railRef.current;
      if (!rail) return;

      const nearEnd = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 12;
      if (nearEnd) {
        rail.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollByCard(1);
      }
    }, 3200);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="store-product-showcase">
      <div className="store-product-showcase__header">
        <div className="store-product-showcase__title">
          <h2>{section.title}</h2>
          <span className="store-product-showcase__divider"></span>
          <span className="store-product-showcase__benefit">
            <i className={`bi ${section.icon}`}></i>
            {section.benefit}
          </span>
        </div>
        <div className="store-product-showcase__chips">
          {section.chips.map(chip => (
            <Link key={chip} to={`/products?q=${encodeURIComponent(chip)}`}>
              {chip}
            </Link>
          ))}
          <Link to="/products" className="store-product-showcase__all">Xem tất cả</Link>
        </div>
      </div>

      <div className="store-product-showcase__carousel">
        <button
          type="button"
          className="store-product-showcase__arrow store-product-showcase__arrow--prev"
          onClick={() => scrollByCard(-1)}
          aria-label={`Xem ${section.title} phía trước`}
        >
          <i className="bi bi-chevron-left"></i>
        </button>

        <div className="store-product-showcase__rail" ref={railRef}>
          {section.products.map(product => (
            <StoreProductCard
              key={`${section.key}-${product.id}`}
              product={product}
              onAddToCart={onAddToCart}
              sectionLabel="Hot"
            />
          ))}
        </div>

        <button
          type="button"
          className="store-product-showcase__arrow store-product-showcase__arrow--next"
          onClick={() => scrollByCard(1)}
          aria-label={`Xem ${section.title} tiếp theo`}
        >
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>
    </section>
  );
};

const getDealDiscount = (product) => 15 + (Number(product?.id || 1) % 21);

const dealTabs = [
  {
    key: 'hot',
    icon: 'bi-fire',
    label: 'Máy hot giá ngon',
    terms: [],
  },
  {
    key: 'laptop',
    icon: 'bi-laptop',
    label: 'Laptop cực chất',
    terms: ['laptop'],
  },
  {
    key: 'pc',
    icon: 'bi-pc-display',
    label: 'Xây dựng PC khỏe mạnh',
    terms: ['pc', 'cpu', 'vga', 'mainboard', 'case'],
  },
  {
    key: 'components',
    icon: 'bi-gpu-card',
    label: 'Linh kiện giảm sâu',
    terms: ['cpu', 'vga', 'ram', 'ssd', 'hdd', 'mainboard', 'nguồn', 'case', 'tản nhiệt'],
  },
  {
    key: 'gear',
    icon: 'bi-keyboard',
    label: 'Thiết bị tiện lợi',
    terms: ['bàn phím', 'chuột', 'tai nghe', 'loa', 'gear', 'phụ kiện'],
  },
];

const DealSaleSection = ({ products }) => {
  const [activeDealTab, setActiveDealTab] = useState(dealTabs[0].key);
  const activeTab = dealTabs.find(tab => tab.key === activeDealTab) || dealTabs[0];
  const matchedProducts = activeTab.terms.length === 0
    ? products
    : products.filter(product => {
      const searchText = getProductSearchText(product);
      return activeTab.terms.some(term => searchText.includes(normalizeCategoryName(term)));
    });
  const dealProducts = (matchedProducts.length > 0 ? matchedProducts : products).slice(0, 5);

  if (dealProducts.length === 0) return null;

  return (
    <section className="store-big-deal" aria-label="Deal sập sàn PCeStore">
      <div className="store-big-deal__head">
        <div className="store-big-deal__mascot">
          <i className="bi bi-lightning-charge-fill"></i>
          <span>Giá trực tuyến</span>
        </div>
        <div className="store-big-deal__title">
          <span>Deal sập sàn</span>
        </div>
      </div>

      <div className="store-big-deal__tabs">
        {dealTabs.map(tab => (
          <button
            type="button"
            className={tab.key === activeDealTab ? 'is-active' : ''}
            onClick={() => setActiveDealTab(tab.key)}
            key={tab.key}
          >
            <i className={`bi ${tab.icon}`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="store-big-deal__body">
        {dealProducts.map(product => {
          const discount = getDealDiscount(product);
          const price = Number(product.price || 0);
          const oldPrice = Math.round(price / (1 - discount / 100) / 1000) * 1000;

          return (
            <Link to={`/products/${product.id}`} className="store-big-deal__card" key={product.id}>
              <div className="store-big-deal__media">
                <img src={product.imageUrl || '/default-product.png'} alt={product.name} />
                <span className="store-big-deal__badge">Sắp cháy hàng</span>
              </div>
              <div className="store-big-deal__slot">
                <i className="bi bi-lightning-charge-fill"></i>
                Còn 20/20 suất
              </div>
              <div className="store-big-deal__price">
                <div>
                  <strong>{formatCurrency(price)}</strong>
                  <span>{formatCurrency(oldPrice)}</span>
                </div>
                <em>-{discount}%</em>
              </div>
              <h3>{product.name}</h3>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

const MidShowcaseBanners = () => {
  const banners = [
    {
      className: 'store-mid-banners__main',
      image: '/showcase-wide-gaming.png',
      alt: 'Laptop và PC chiến game PCeStore',
      href: '/products?q=Laptop%20gaming',
    },
    {
      className: 'store-mid-banners__side',
      image: '/showcase-headset.jpg',
      alt: 'Tai nghe gaming PCeStore',
      href: '/products?q=Tai%20nghe',
    },
    {
      className: 'store-mid-banners__side',
      image: '/showcase-pc-gaming.jpg',
      alt: 'Build PC gaming hiệu năng cao',
      href: '/products?q=Build%20PC',
    },
  ];

  return (
    <section className="store-mid-banners" aria-label="Khuyến mãi nổi bật">
      {banners.map(banner => (
        <Link to={banner.href} className={banner.className} key={banner.image}>
          <img src={banner.image} alt={banner.alt} loading="lazy" />
        </Link>
      ))}
    </section>
  );
};

const ComponentShowcaseBanners = () => {
  const banners = [
    {
      className: 'store-mid-banners__main',
      image: '/showcase-laptop-components.jpg',
      alt: 'Laptop va linh kien chinh hang PCeStore',
      href: '/products?q=Laptop%20linh%20kien',
    },
    {
      className: 'store-mid-banners__side',
      image: '/showcase-components-room.jpg',
      alt: 'Linh kien may tinh PCeStore',
      href: '/products?q=Linh%20kien',
    },
    {
      className: 'store-mid-banners__side',
      image: '/showcase-pc-components.jpg',
      alt: 'Phu kien va linh kien PC gaming PCeStore',
      href: '/products?q=Phu%20kien%20gaming',
    },
  ];

  return (
    <section className="store-mid-banners" aria-label="Khuyen mai linh kien">
      {banners.map(banner => (
        <Link to={banner.href} className={banner.className} key={banner.image}>
          <img src={banner.image} alt={banner.alt} loading="lazy" />
        </Link>
      ))}
    </section>
  );
};

const getCategoryIcon = (name = '') => {
  const value = normalizeCategoryName(name);

  if (value.includes('laptop') && value.includes('gaming')) return 'bi-laptop';
  if (value.includes('laptop')) return 'bi-laptop';
  if (value.includes('cpu')) return 'bi-cpu';
  if (value.includes('main')) return 'bi-motherboard';
  if (value.includes('ram')) return 'bi-memory';
  if (value.includes('vga') || value.includes('gpu')) return 'bi-gpu-card';
  if (value.includes('ssd')) return 'bi-device-ssd';
  if (value.includes('hdd')) return 'bi-device-hdd';
  if (value.includes('nguon') || value.includes('psu')) return 'bi-lightning-charge';
  if (value.includes('case')) return 'bi-pc-display-horizontal';
  if (value.includes('tan nhiet') || value.includes('cooler')) return 'bi-fan';
  if (value.includes('gear')) return 'bi-keyboard';
  if (value.includes('man hinh') || value.includes('monitor')) return 'bi-display';

  return 'bi-grid-3x3-gap';
};

const getShowcaseMegaSections = (name = '') => {
  const value = normalizeCategoryName(name);

  if (value.includes('laptop') && value.includes('gaming')) {
    return [
      { title: 'Thương hiệu', items: ['ACER / PREDATOR', 'ASUS / ROG', 'MSI', 'LENOVO', 'GIGABYTE / AORUS'] },
      { title: 'Giá bán', items: ['Dưới 20 triệu', 'Từ 20 đến 25 triệu', 'Từ 25 đến 30 triệu', 'Trên 30 triệu', 'Gaming RTX 50 Series'] },
      { title: 'ACER | PREDATOR', items: ['Nitro Series', 'Predator Series', 'ACER RTX 50 Series'] },
      { title: 'ASUS | ROG Gaming', items: ['ROG Series', 'TUF Series', 'Zephyrus Series', 'ASUS RTX 50 Series'] },
      { title: 'MSI Gaming', items: ['Titan GT Series', 'Stealth GS Series', 'Raider GE Series', 'Vector GP Series', 'MSI RTX 50 Series'] },
      { title: 'Cấu hình', items: ['RTX 50 Series', 'CPU Core Ultra', 'CPU AMD'] },
    ];
  }

  if (value.includes('laptop')) {
    return [
      { title: 'Thương hiệu', items: ['ASUS', 'ACER', 'MSI', 'LENOVO', 'LG - Gram'] },
      { title: 'Giá bán', items: ['Dưới 15 triệu', 'Từ 15 đến 20 triệu', 'Trên 20 triệu'] },
      { title: 'CPU Intel - AMD', items: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'AMD Ryzen'] },
      { title: 'Nhu cầu sử dụng', items: ['Đồ họa - Studio', 'Học sinh - Sinh viên', 'Mỏng nhẹ cao cấp'] },
      { title: 'Linh phụ kiện Laptop', items: ['RAM laptop', 'SSD laptop', 'Ổ cứng di động'] },
      { title: 'Laptop ASUS', items: ['ASUS OLED Series', 'Vivobook Series', 'Zenbook Series'] },
      { title: 'Laptop Lenovo', items: ['Thinkbook Series', 'Ideapad Series', 'Thinkpad Series', 'Yoga Series'] },
    ];
  }

  if (value.includes('main') || value.includes('cpu') || value.includes('vga')) {
    return [
      { title: 'VGA RTX 50 SERIES', items: ['RTX 5090', 'RTX 5080', 'RTX 5070Ti', 'RTX 5070', 'RTX 5060Ti', 'RTX 5060'] },
      { title: 'VGA (Trên 12 GB VRAM)', items: ['RTX 4070 SUPER (12GB)', 'RTX 4070Ti SUPER (16GB)', 'RTX 4080 SUPER (16GB)', 'RTX 4090 SUPER (24GB)'] },
      { title: 'VGA (Dưới 12 GB VRAM)', items: ['RTX 4060Ti (8 - 16GB)', 'RTX 4060 (8GB)', 'RTX 3060 (12GB)', 'GTX 1650 (4GB)'] },
      { title: 'Bo mạch chủ Intel', items: ['Z890 (Mới)', 'Z790', 'B760', 'H610', 'Xem tất cả'] },
      { title: 'Bo mạch chủ AMD', items: ['AMD X870 (Mới)', 'AMD X670', 'AMD B650 (Mới)', 'AMD B550', 'AMD A320'] },
      { title: 'CPU - Bộ vi xử lý Intel', items: ['CPU Intel Core Ultra Series 2', 'CPU Intel 9', 'CPU Intel 7', 'CPU Intel 5', 'CPU Intel 3'] },
      { title: 'CPU - Bộ vi xử lý AMD', items: ['CPU AMD Athlon', 'CPU AMD R3', 'CPU AMD R5', 'CPU AMD R7', 'CPU AMD R9'] },
    ];
  }

  if (value.includes('ram') || value.includes('ssd') || value.includes('hdd') || value.includes('o cung')) {
    return [
      { title: 'RAM máy tính', items: ['RAM DDR5', 'RAM DDR4', 'RAM 16GB', 'RAM 32GB', 'RAM laptop'] },
      { title: 'SSD', items: ['SSD 256GB', 'SSD 512GB', 'SSD 1TB', 'SSD NVMe Gen4', 'SSD SATA'] },
      { title: 'HDD', items: ['HDD 1TB', 'HDD 2TB', 'HDD 4TB', 'Ổ cứng di động'] },
      { title: 'Thương hiệu', items: ['Kingston', 'Samsung', 'WD', 'Crucial', 'Corsair'] },
    ];
  }

  return [
    { title: name || 'Danh mục', items: [name, `${name} giá tốt`, `${name} mới về`, `${name} cao cấp`].filter(Boolean) },
    { title: 'Gợi ý nhanh', items: ['Sản phẩm nổi bật', 'Hàng mới về', 'Bán chạy', 'Khuyến mãi'] },
    { title: 'Nhu cầu', items: ['Gaming', 'Văn phòng', 'Đồ họa', 'Học tập'] },
    { title: 'Thương hiệu', items: ['ASUS', 'MSI', 'LENOVO', 'GIGABYTE', 'CORSAIR'] },
  ];
};

export default function Home() {
  const [activeTab, setActiveTab] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeShowcaseCategory, setActiveShowcaseCategory] = useState(null);
  const [tabProducts, setTabProducts] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [homeProducts, setHomeProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showEntryPromo, setShowEntryPromo] = useState(false);
  const [promoIndex, setPromoIndex] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    const initHome = async () => {
      try {
        const [catRes, prodRes, homeProdRes] = await Promise.all([
          apiClient.get('/categories'),
          apiClient.get('/products?size=5'),
          apiClient.get('/products?size=100'),
        ]);

        setCategories(catRes.data);
        if (catRes.data.length > 0) {
          setActiveTab(catRes.data[0].id);
        }
        setFlashSaleProducts(prodRes.data.content || []);
        setHomeProducts(homeProdRes.data.content || []);
      } catch (err) {
        console.error('Loi khoi tao Home:', err);
      } finally {
        setLoading(false);
      }
    };
    initHome();
  }, []);

  useEffect(() => {
    if (!activeTab) return;

    apiClient.get(`/products?categoryId=${activeTab}&size=10`)
      .then(res => setTabProducts(res.data.content || []))
      .catch(err => console.error('Lỗi tải sản phẩm theo danh mục:', err));
  }, [activeTab]);

  useEffect(() => {
    const timer = setInterval(() => {
      setPromoIndex(current => (current + 1) % promoSlides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem('pcestore-entry-promo-seen')) return;

    setShowEntryPromo(true);
    sessionStorage.setItem('pcestore-entry-promo-seen', '1');
  }, []);

  const handleAddToCart = (p) => {
    addToCart({
      productId: p.id,
      productName: p.name,
      price: p.price,
      image: p.imageUrl,
      imageUrl: p.imageUrl,
      quantity: 1,
    });
    setToast(`Đã thêm "${p.name}" vào giỏ hàng!`);
    setTimeout(() => setToast(null), 2500);
  };

  const showPrevPromo = () => {
    setPromoIndex(current => (current - 1 + promoSlides.length) % promoSlides.length);
  };

  const showNextPromo = () => {
    setPromoIndex(current => (current + 1) % promoSlides.length);
  };

  const visiblePromoSlides = [
    promoSlides[promoIndex],
    promoSlides[(promoIndex + 1) % promoSlides.length],
  ];
  const showcaseCategories = categories.length > 0
    ? categories.slice(0, 13).map(cat => ({ id: cat.id, name: cat.name }))
    : fallbackCategories.slice(0, 13).map(name => ({ id: name, name }));
  const activeShowcaseSections = activeShowcaseCategory
    ? getShowcaseMegaSections(activeShowcaseCategory.name)
    : [];
  const showcaseProductGroups = productShowcaseSections
    .map(section => {
      const pickedProducts = pickProductsForSection(homeProducts, section);
      return {
        ...section,
        products: pickedProducts.length > 0 ? pickedProducts : homeProducts.slice(0, 5),
      };
    });

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border store-spinner"></div>
      </div>
    );
  }

  return (
    <>
      {toast && (
        <div className="store-toast">
          <i className="bi bi-cart-check me-2"></i>{toast}
        </div>
      )}

      {showEntryPromo && (
        <div className="store-entry-promo" role="dialog" aria-modal="true" aria-label="Khuyến mãi PCeStore">
          <div className="store-entry-promo__backdrop" onClick={() => setShowEntryPromo(false)}></div>
          <div className="store-entry-promo__dialog">
            <button
              type="button"
              className="store-entry-promo__close"
              onClick={() => setShowEntryPromo(false)}
              aria-label="Đóng quảng cáo"
            >
              <i className="bi bi-x-lg"></i>
            </button>
            <Link to="/products" className="store-entry-promo__image" onClick={() => setShowEntryPromo(false)}>
              <img src="/promo-entry-popup.png" alt="Build laptop và PC ngon cùng PCeStore" />
            </Link>
          </div>
        </div>
      )}

      <div className="store-side-banners" aria-label="Banner khuyến mãi hai bên">
        <Link to="/products" className="store-side-banner store-side-banner--left">
          <img src="/side-banners/left-tech-city.jpg" alt="PCeStore công nghệ tương lai" />
        </Link>
        <Link to="/products" className="store-side-banner store-side-banner--right">
          <img src="/side-banners/right-tech-showroom.jpg" alt="PCeStore showroom công nghệ" />
        </Link>
      </div>

      <div className="container store-home">
        <section
          className="store-showcase mb-3"
          onMouseLeave={() => setActiveShowcaseCategory(null)}
        >
          <aside className="store-showcase__sidebar" aria-label="Danh mục nhanh">
            {showcaseCategories.map(cat => (
              <Link
                key={cat.id}
                to={typeof cat.id === 'number' ? `/products?category=${cat.id}` : `/products?q=${encodeURIComponent(cat.name)}`}
                className={`store-showcase__category ${activeShowcaseCategory?.id === cat.id ? 'is-active' : ''}`}
                onMouseEnter={() => setActiveShowcaseCategory(cat)}
                onMouseMove={() => setActiveShowcaseCategory(cat)}
                onPointerEnter={() => setActiveShowcaseCategory(cat)}
              >
                <span>
                  <i className={`bi ${getCategoryIcon(cat.name)}`}></i>
                  {cat.name}
                </span>
                <i className="bi bi-chevron-right"></i>
              </Link>
            ))}
          </aside>

          <div className="store-showcase__main">
            {activeShowcaseCategory && (
              <div className="store-showcase__mega">
                {activeShowcaseSections.map(section => (
                  <div className="store-showcase__mega-group" key={section.title}>
                    <h3>{section.title}</h3>
                    {section.items.map(item => (
                      <Link key={item} to={`/products?q=${encodeURIComponent(item)}`}>
                        {item}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            )}
            <section className="store-hero store-hero--image">
              <div className="store-hero__main"></div>
            </section>
          </div>
        </section>

        <section className="store-promo-carousel mb-4" aria-label="Khuyến mãi nổi bật">
          <button
            type="button"
            className="store-promo-carousel__arrow store-promo-carousel__arrow--prev"
            onClick={showPrevPromo}
            aria-label="Khuyến mãi trước"
          >
            <i className="bi bi-chevron-left"></i>
          </button>

          <div className="store-promo-carousel__viewport">
            <div className="store-promo-carousel__grid">
              {visiblePromoSlides.map((slide, index) => (
                <Link
                  to="/products"
                  className="store-promo-slide"
                  key={`${slide.image}-${index}`}
                  aria-label={slide.alt}
                >
                  <img src={slide.image} alt={slide.alt} />
                </Link>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="store-promo-carousel__arrow store-promo-carousel__arrow--next"
            onClick={showNextPromo}
            aria-label="Khuyến mãi tiếp theo"
          >
            <i className="bi bi-chevron-right"></i>
          </button>

        </section>

        <DealSaleSection products={homeProducts.length > 0 ? homeProducts : flashSaleProducts} />

        <section className="store-latest-section mt-5">
          <div className="store-section__header mb-3">
            <div>
              <h2>Sản phẩm mới nhất</h2>
            </div>
            <Link to="/products" className="store-link-strong">Xem thêm</Link>
          </div>
          <div className="store-latest-section__grid">
            {flashSaleProducts.map((p) => (
              <StoreProductCard product={p} onAddToCart={handleAddToCart} sectionLabel="Mới về" key={p.id} />
            ))}
          </div>
        </section>

        <div className="store-product-showcase-stack mt-4">
          {showcaseProductGroups.map((section, index) => (
            <React.Fragment key={section.key}>
              <ProductShowcaseSection
                section={section}
                onAddToCart={handleAddToCart}
              />
              {index === 0 && <MidShowcaseBanners />}
              {section.key === 'office-laptop' && <ComponentShowcaseBanners />}
            </React.Fragment>
          ))}
        </div>

        <section className="store-product-categories mt-5">
          <h2>Danh mục sản phẩm</h2>
          <div className="store-product-categories__grid">
            {productCategoryTiles.map(([name, image]) => (
              <Link key={name} to={`/products?q=${encodeURIComponent(name)}`}>
                <span className="store-product-categories__visual">
                  <img src={image} alt={name} loading="lazy" />
                </span>
                <strong>{name}</strong>
              </Link>
            ))}
          </div>
        </section>

        <section className="store-policy-row store-policy-row--footer">
          {[
            ['bi-truck', 'CHÍNH SÁCH GIAO HÀNG', 'Nhận hàng và thanh toán tại nhà'],
            ['bi-arrow-counterclockwise', '1 ĐỔI 1 LÊN ĐẾN 30 NGÀY', 'Đổi với sản phẩm có lỗi từ nhà sản xuất'],
            ['bi-credit-card-fill', 'THANH TOÁN TIỆN LỢI', 'Trả tiền mặt, CK, trả góp 0%'],
            ['bi-headset', 'HỖ TRỢ NHIỆT TÌNH', 'Tư vấn, giải đáp mọi thắc mắc'],
          ].map(([icon, title, desc]) => (
            <div className="store-policy" key={title}>
              <i className={`bi ${icon}`}></i>
              <div>
                <strong>{title}</strong>
                <span>{desc}</span>
              </div>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
