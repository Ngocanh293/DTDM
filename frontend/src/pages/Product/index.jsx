import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { formatCurrency } from '../../utils';
import { useCart } from '../../context/CartContext';
import apiClient from '../../services/api';
import { extractSpecs, collectAvailableFilters } from '../../utils/filterUtils';
import StoreProductCard from '../../components/StoreProductCard';

const ITEMS_PER_PAGE = 12;

const SORT_OPTIONS = [
  { value: 'default', label: 'Mac dinh' },
  { value: 'price-asc', label: 'Gia tang dan' },
  { value: 'price-desc', label: 'Gia giam dan' },
  { value: 'name-asc', label: 'A-Z' },
  { value: 'name-desc', label: 'Z-A' },
];

export default function Product() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [compareProducts, setCompareProducts] = useState([]);
  const [expandedSections, setExpandedSections] = useState(['Danh muc', 'Muc gia', 'Thuong hieu']);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000000 });
  const { addToCart } = useCart();

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const cat = searchParams.get('category') || '';
    setKeyword(q);
    setSelectedCategoryId(cat);
    setCurrentPage(1);
  }, [searchParams]);

  useEffect(() => {
    apiClient.get('/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Loi tai danh muc:', err));
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = `/products?page=${currentPage - 1}&size=${ITEMS_PER_PAGE}`;
        if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
        if (selectedCategoryId) url += `&categoryId=${selectedCategoryId}`;

        const res = await apiClient.get(url);
        setProducts(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalItems(res.data.totalElements || 0);
      } catch (err) {
        console.error('Loi tai san pham API:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, keyword, selectedCategoryId]);

  const handleAddToCart = (product) => {
    addToCart({
      productId: product.id,
      productName: product.name,
      price: product.price,
      image: product.imageUrl,
      imageUrl: product.imageUrl,
      quantity: 1,
    });
    setToast(`Da them "${product.name}" vao gio hang!`);
    setTimeout(() => setToast(null), 2500);
  };

  const handleCategoryChange = (catId) => {
    const newId = selectedCategoryId == catId ? '' : catId;
    setSelectedCategoryId(newId);
    setSearchParams(newId ? { category: newId } : {});
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (keyword.trim()) params.q = keyword.trim();
    if (selectedCategoryId) params.category = selectedCategoryId;
    setSearchParams(params);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setKeyword('');
    setSelectedCategoryId('');
    setSortBy('default');
    setSelectedFilters({});
    setPriceRange({ min: 0, max: 100000000 });
    setCompareProducts([]);
    setCurrentPage(1);
    setSearchParams({});
  };

  const handleFilterToggle = (filterName, value) => {
    setSelectedFilters(prev => {
      const currentSelected = prev[filterName] || [];
      const newSelected = currentSelected.includes(value)
        ? currentSelected.filter(v => v !== value)
        : [...currentSelected, value];

      return { ...prev, [filterName]: newSelected };
    });
    setCurrentPage(1);
  };

  const handleCompareToggle = (product) => {
    setCompareProducts(prev => {
      if (prev.some(item => item.id === product.id)) {
        return prev.filter(item => item.id !== product.id);
      }
      if (prev.length >= 3) {
        setToast('Chi co the so sanh toi da 3 san pham.');
        setTimeout(() => setToast(null), 2500);
        return prev;
      }
      return [...prev, product];
    });
  };

  const availableFilters = useMemo(() => {
    const catName = categories.find(c => c.id == selectedCategoryId)?.name || keyword || '';
    return collectAvailableFilters(products, catName);
  }, [products, categories, selectedCategoryId, keyword]);

  const currentCategoryName = categories.find(c => c.id == selectedCategoryId)?.name || keyword || '';

  const filteredAndSortedProducts = useMemo(() => {
    let results = [...products];

    Object.keys(selectedFilters).forEach(filterKey => {
      const activeValues = selectedFilters[filterKey];
      if (activeValues && activeValues.length > 0) {
        results = results.filter(p => {
          const specs = extractSpecs(p.name, currentCategoryName);
          return activeValues.includes(specs[filterKey]);
        });
      }
    });

    results = results.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

    switch (sortBy) {
      case 'price-asc': return results.sort((a, b) => a.price - b.price);
      case 'price-desc': return results.sort((a, b) => b.price - a.price);
      case 'name-asc': return results.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc': return results.sort((a, b) => b.name.localeCompare(a.name));
      default: return results;
    }
  }, [products, sortBy, selectedFilters, currentCategoryName, priceRange]);

  const toggleSection = (section) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section],
    );
  };

  return (
    <>
      {toast && (
        <div className="store-toast">
          <i className="bi bi-cart-check me-2"></i>{toast}
        </div>
      )}

      <div className="container pb-5 store-product-page">
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Trang chu</Link></li>
            <li className="breadcrumb-item active" aria-current="page">San pham</li>
          </ol>
        </nav>

        <div className="store-list-hero mb-4">
          <div>
            <span className="store-eyebrow">PCeStore Catalog</span>
            <h1>{categories.find(c => c.id == selectedCategoryId)?.name || keyword || 'Tat ca san pham'}</h1>
            <p>{totalItems} san pham dang co san, loc nhanh theo nhu cau va ngan sach.</p>
          </div>
          <form className="store-list-search" onSubmit={handleSearch}>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tim CPU, VGA, RAM..."
            />
            <button type="submit"><i className="bi bi-search"></i></button>
          </form>
        </div>

        <div className="row">
          <aside className="col-lg-3 mb-4">
            <div className="store-filter-card mb-3">
              <div className="store-filter-card__head">
                <strong>Muc gia</strong>
                <button type="button" onClick={handleClearFilters}>Xoa loc</button>
              </div>
              <div className="d-flex align-items-center gap-2 mb-3 mt-3">
                <div className="store-price-pill">{formatCurrency(priceRange.min)}</div>
                <span>-</span>
                <div className="store-price-pill">{formatCurrency(priceRange.max)}</div>
              </div>
              <input
                type="range"
                min="0"
                max="100000000"
                step="500000"
                value={priceRange.max}
                onChange={(e) => {
                  setPriceRange(p => ({ ...p, max: Number(e.target.value) }));
                  setCurrentPage(1);
                }}
                className="w-100 store-range"
              />
            </div>

            <div className="store-filter-card">
              {!selectedCategoryId && !keyword && (
                <div className="store-filter-section">
                  <button type="button" onClick={() => toggleSection('Danh muc')}>
                    Danh muc <i className={`bi bi-caret-${expandedSections.includes('Danh muc') ? 'up' : 'down'}-fill`}></i>
                  </button>
                  {expandedSections.includes('Danh muc') && (
                    <div className="store-filter-options">
                      {categories.map(cat => (
                        <label key={cat.id}>
                          <input type="checkbox" checked={selectedCategoryId == cat.id} onChange={() => handleCategoryChange(cat.id)} />
                          <span>{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {Object.keys(availableFilters).map(filterName => (
                <div className="store-filter-section" key={filterName}>
                  <button type="button" onClick={() => toggleSection(filterName)}>
                    {filterName} <i className={`bi bi-caret-${expandedSections.includes(filterName) ? 'up' : 'down'}-fill`}></i>
                  </button>
                  {expandedSections.includes(filterName) && (
                    <div className="store-filter-options">
                      {availableFilters[filterName].map(val => (
                        <label key={val}>
                          <input
                            type="checkbox"
                            checked={(selectedFilters[filterName] || []).includes(val)}
                            onChange={() => handleFilterToggle(filterName, val)}
                          />
                          <span>{val}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>

          <main className="col-lg-9">
            <div className="store-sortbar d-flex align-items-center p-2 rounded gap-2 flex-wrap mb-3">
              <strong className="me-2 text-dark">Sap xep:</strong>
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`btn btn-sm ${sortBy === opt.value ? 'store-sortbar__active' : 'store-sortbar__item'}`}
                  onClick={() => setSortBy(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {compareProducts.length > 0 && (
              <div className="store-compare-bar mb-3">
                <div>
                  <strong>Dang so sanh {compareProducts.length}/3</strong>
                  <span>{compareProducts.map(item => item.name).join(' | ')}</span>
                </div>
                <button className="btn btn-sm store-btn-ghost" onClick={() => setCompareProducts([])}>
                  Xoa so sanh
                </button>
              </div>
            )}

            {loading ? (
              <div className="text-center py-5"><div className="spinner-border store-spinner"></div></div>
            ) : filteredAndSortedProducts.length === 0 ? (
              <div className="store-empty">
                <h5>Khong tim thay san pham nao</h5>
                <p>Thu doi tu khoa hoac xoa bo loc hien tai.</p>
              </div>
            ) : (
              <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
                {filteredAndSortedProducts.map(product => (
                  <div className="col" key={product.id}>
                    <StoreProductCard
                      product={product}
                      onAddToCart={handleAddToCart}
                      onCompare={handleCompareToggle}
                      isCompared={compareProducts.some(item => item.id === product.id)}
                      sectionLabel="Gia tot"
                    />
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <nav className="mt-4">
                <ul className="pagination justify-content-center">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <li className={`page-item ${p === currentPage ? 'active' : ''}`} key={p}>
                      <button className="page-link" onClick={() => setCurrentPage(p)}>{p}</button>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
