import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils';
import { useCart } from '../../context/CartContext';
import apiClient from '../../services/api';
import StoreProductCard from '../../components/StoreProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/products/${id}`);
        setProduct(res.data);
        
        if (res.data.categoryId) {
          const relatedRes = await apiClient.get(`/products?categoryId=${res.data.categoryId}&size=5`);
          setRelatedProducts(relatedRes.data.content.filter(p => p.id !== Number(id)));
        }

        // Fetch ratings & reviews metadata
        const avgRes = await apiClient.get(`/reviews/product/${id}/average`);
        setAverageRating(avgRes.data || 0);

        const revRes = await apiClient.get(`/reviews/product/${id}?size=1`);
        setTotalReviews(revRes.data.totalElements || 0);
      } catch (err) {
        console.error("Lỗi tải chi tiết SP:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
    window.scrollTo(0, 0);
  }, [id]);

  // Xử lý tăng/giảm số lượng
  const handleQuantityChange = (delta) => {
    setQuantity(prev => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (product && next > product.stock) return product.stock;
      return next;
    });
  };

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      productName: product.name,
      price: product.price,
      image: product.imageUrl,
      quantity,
    });
    setToast(`Đã thêm ${quantity}x "${product.name}" vào giỏ hàng!`);
    setTimeout(() => setToast(null), 2500);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const handleAddRelatedToCart = (item) => {
    addToCart({
      productId: item.id,
      productName: item.name,
      price: item.price,
      image: item.imageUrl,
      imageUrl: item.imageUrl,
      quantity: 1,
    });
    setToast(`Đã thêm "${item.name}" vào giỏ hàng!`);
    setTimeout(() => setToast(null), 2500);
  };

  if (loading) return <div className="text-center p-5 mt-5"><div className="spinner-border text-danger"></div></div>;

  if (!product) {
    return (
      <div className="container py-5 text-center">
        <h3 className="text-muted">Không tìm thấy sản phẩm</h3>
        <Link to="/products" className="btn btn-danger mt-3">Quay lại danh sách</Link>
      </div>
    );
  }

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#323232', color: '#fff', padding: '0.75rem 1.5rem',
          borderRadius: '8px', zIndex: 9999, fontSize: '0.9rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)', whiteSpace: 'nowrap',
        }}>
          <i className="bi bi-cart-check me-2 text-success"></i>{toast}
        </div>
      )}
      <div className="container pb-5 store-detail-page">
      {/* ============================================================ */}
      {/* BREADCRUMB */}
      {/* ============================================================ */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none">Trang chủ</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/products" className="text-decoration-none">Sản phẩm</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to={`/products?category=${product.categoryId}`} className="text-decoration-none">
              {product.categoryName}
            </Link>
          </li>
          <li className="breadcrumb-item active text-truncate" aria-current="page" style={{ maxWidth: '250px' }}>
            {product.name}
          </li>
        </ol>
      </nav>

      {/* ============================================================ */}
      {/* THÔNG TIN SẢN PHẨM CHÍNH */}
      {/* ============================================================ */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="row g-4">
            {/* === CỘT TRÁI: Hình ảnh === */}
            <div className="col-lg-5 mb-4 mb-lg-0">
              <div className="bg-light rounded-3 p-4 text-center position-relative" style={{ minHeight: '350px' }}>
                {/* Badge trạng thái */}
                {product.stock > 0 && product.stock <= 10 && (
                  <span className="position-absolute top-0 start-0 m-3 badge bg-warning text-dark">
                    <i className="bi bi-exclamation-triangle me-1"></i>Chỉ còn {product.stock}
                  </span>
                )}
                {product.stock === 0 && (
                  <span className="position-absolute top-0 start-0 m-3 badge bg-secondary">
                    <i className="bi bi-x-circle me-1"></i>Hết hàng
                  </span>
                )}

                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="img-fluid"
                  style={{ maxHeight: '320px', objectFit: 'contain' }}
                />
              </div>

              {/* Thumbnail placeholder — Khi có nhiều ảnh sẽ dùng */}
              <div className="d-flex gap-2 mt-3 justify-content-center">
                <div className="border rounded p-1 bg-light" style={{ width: '64px', height: '64px', cursor: 'pointer' }}>
                  <img src={product.imageUrl} alt="" className="img-fluid h-100 w-100" style={{ objectFit: 'contain' }} />
                </div>
              </div>
            </div>

            {/* === CỘT PHẢI: Thông tin === */}
            <div className="col-lg-7">
              {/* Danh mục & Thương hiệu */}
              <div className="d-flex align-items-center gap-2 mb-2">
                <Link
                  to={`/products?category=${product.categoryId}`}
                  className="badge bg-danger bg-opacity-10 text-danger text-decoration-none"
                >
                  {product.categoryName}
                </Link>
                <span className="badge bg-light text-dark border">{product.brand}</span>
              </div>

              {/* Tên sản phẩm */}
              <h1 className="h3 fw-bold mb-3" style={{ color: '#2b3452' }}>{product.name}</h1>

              {/* Mã sản phẩm & Đánh giá */}
              <div className="d-flex align-items-center gap-3 mb-3 text-muted small">
                <span>
                  <i className="bi bi-upc-scan me-1"></i>Mã SP: <strong>PRD{String(product.id).padStart(3, '0')}</strong>
                </span>
                <span className="text-secondary">|</span>
                <span className="d-flex align-items-center">
                  {[1, 2, 3, 4, 5].map(star => {
                    let starClass = "bi-star text-muted";
                    if (averageRating >= star) {
                        starClass = "bi-star-fill text-warning";
                    } else if (averageRating >= star - 0.5) {
                        starClass = "bi-star-half text-warning";
                    }
                    return <i key={star} className={`bi ${starClass}`}></i>;
                  })}
                  <span className="ms-1 fw-bold text-dark">{averageRating.toFixed(1)}</span>
                  <span className="ms-1">({totalReviews} đánh giá)</span>
                </span>
              </div>

              <hr />

              {/* Giá */}
              <div className="mb-4">
                <div className="d-flex align-items-end gap-3">
                  <span className="text-danger fw-bold" style={{ fontSize: '28px' }}>
                    {formatCurrency(product.price)}
                  </span>
                </div>
                <small className="text-muted">
                  <i className="bi bi-shield-check me-1 text-success"></i>Bảo hành chính hãng
                </small>
              </div>

              {/* Thông tin nhanh & Khuyến mãi */}
              <div className="row g-3 mb-4">
                 <div className="col-12 col-md-6">
                    <div className="bg-light rounded p-3 h-100 border">
                      <h6 className="fw-bold mb-2 fs-6">
                        <i className="bi bi-info-circle-fill text-secondary me-2"></i>Thông số kỹ thuật
                      </h6>
                      <div className="small">
                        {Object.entries(product.specs || {}).slice(0, 5).map(([key, value]) => (
                          <div className="d-flex justify-content-between border-bottom py-1" key={key}>
                            <span className="text-muted">{key}:</span>
                            <span className="fw-medium text-end" style={{ maxWidth: '60%' }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                 </div>
                 <div className="col-12 col-md-6">
                    <div className="rounded p-3 h-100" style={{ backgroundColor: '#fff3f4', border: '1px dashed #e30019' }}>
                      <h6 className="fw-bold fs-6" style={{ color: '#e30019' }}>
                        <i className="bi bi-gift-fill me-2"></i>Khuyến mãi đặc biệt
                      </h6>
                      <ul className="list-unstyled mb-0 small">
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Tặng kèm Áo thun Độc quyền áp dụng cho đơn hàng PC.</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Giảm lến đến 500k khi mua kèm Màn Hình.</li>
                        <li className="mb-0"><i className="bi bi-check-circle-fill text-success me-2"></i>Hỗ trợ trả góp 0% qua MPOS.</li>
                      </ul>
                    </div>
                 </div>
              </div>

              {/* Trạng thái kho */}
              <div className="mb-4">
                {product.stock > 10 ? (
                  <span className="text-success fw-medium">
                    <i className="bi bi-check-circle-fill me-1"></i>Còn hàng ({product.stock} sản phẩm)
                  </span>
                ) : product.stock > 0 ? (
                  <span className="text-warning fw-medium">
                    <i className="bi bi-exclamation-circle-fill me-1"></i>Sắp hết — Chỉ còn {product.stock} sản phẩm
                  </span>
                ) : (
                  <span className="text-secondary fw-medium">
                    <i className="bi bi-x-circle-fill me-1"></i>Tạm hết hàng
                  </span>
                )}
              </div>

              {/* Chọn số lượng */}
              <div className="d-flex align-items-center gap-3 mb-4">
                <span className="fw-medium text-secondary">Số lượng:</span>
                <div className="input-group" style={{ width: '140px' }}>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <i className="bi bi-dash"></i>
                  </button>
                  <input
                    type="text"
                    className="form-control text-center fw-bold"
                    value={quantity}
                    readOnly
                  />
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                </div>
              </div>

              {/* Nút hành động */}
              <div className="row g-2 mt-2">
                <div className="col-12 col-sm-6">
                   <button
                     className="btn btn-danger w-100 p-3 rounded"
                     disabled={product.stock === 0}
                     onClick={handleBuyNow}
                     style={{ backgroundColor: '#e30019', borderColor: '#e30019' }}
                   >
                     <div className="fw-bold fs-5 text-uppercase">Mua ngay</div>
                     <small className="fw-normal d-none d-lg-block">Giao hàng tận nơi toàn quốc</small>
                   </button>
                </div>
                <div className="col-12 col-sm-6">
                   <button
                     className="btn bg-white w-100 p-3 rounded"
                     disabled={product.stock === 0}
                     onClick={handleAddToCart}
                     style={{ border: '2px solid #e30019', color: '#e30019' }}
                   >
                     <div className="fw-bold fs-5 text-uppercase">Thêm vào giỏ</div>
                     <small className="fw-normal d-none d-lg-block">Tiếp tục mua sắm</small>
                   </button>
                </div>
              </div>

              {/* Chính sách */}
              <div className="row g-3 mt-4 pt-3 border-top">
                <div className="col-6 col-md-3">
                  <div className="text-center">
                    <i className="bi bi-truck text-danger fs-4 d-block mb-1"></i>
                    <small className="text-muted">Giao hàng<br/>toàn quốc</small>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="text-center">
                    <i className="bi bi-shield-check text-danger fs-4 d-block mb-1"></i>
                    <small className="text-muted">Bảo hành<br/>chính hãng</small>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="text-center">
                    <i className="bi bi-arrow-repeat text-danger fs-4 d-block mb-1"></i>
                    <small className="text-muted">Đổi trả<br/>7 ngày</small>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="text-center">
                    <i className="bi bi-headset text-danger fs-4 d-block mb-1"></i>
                    <small className="text-muted">Hỗ trợ<br/>24/7</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TABS: Mô tả & Thông số kỹ thuật */}
      {/* ============================================================ */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-bottom-0 pt-3 px-4">
          <ul className="nav nav-tabs border-0" role="tablist">
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold ${activeTab === 'description' ? 'active text-danger' : 'text-secondary'}`}
                onClick={() => setActiveTab('description')}
                style={activeTab === 'description' ? { borderBottomColor: '#dc3545', borderBottomWidth: '2px' } : {}}
              >
                <i className="bi bi-file-text me-1"></i>Mô tả sản phẩm
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold ${activeTab === 'specs' ? 'active text-danger' : 'text-secondary'}`}
                onClick={() => setActiveTab('specs')}
                style={activeTab === 'specs' ? { borderBottomColor: '#dc3545', borderBottomWidth: '2px' } : {}}
              >
                <i className="bi bi-cpu me-1"></i>Thông số kỹ thuật
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold ${activeTab === 'reviews' ? 'active text-danger' : 'text-secondary'}`}
                onClick={() => setActiveTab('reviews')}
                style={activeTab === 'reviews' ? { borderBottomColor: '#dc3545', borderBottomWidth: '2px' } : {}}
              >
                <i className="bi bi-chat-left-dots me-1"></i>Đánh giá (0)
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body p-4">
          {/* Tab: Mô tả */}
          {activeTab === 'description' && (
            <div>
              <p className="text-secondary lh-lg" style={{ whiteSpace: 'pre-line' }}>
                {product.description}
              </p>

              <div className="bg-light rounded-3 p-3 mt-3">
                <h6 className="fw-semibold mb-2"><i className="bi bi-gift text-danger me-2"></i>Ưu đãi khi mua hàng</h6>
                <ul className="list-unstyled mb-0 small">
                  <li className="mb-1"><i className="bi bi-check-circle text-success me-2"></i>Miễn phí giao hàng cho đơn từ 500.000đ</li>
                  <li className="mb-1"><i className="bi bi-check-circle text-success me-2"></i>Tích điểm thành viên cho mỗi đơn hàng</li>
                  <li className="mb-1"><i className="bi bi-check-circle text-success me-2"></i>Hỗ trợ trả góp 0% lãi suất qua thẻ tín dụng</li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab: Thông số kỹ thuật */}
          {activeTab === 'specs' && (
            <div className="table-responsive">
              <table className="table table-striped table-hover mb-0">
                <tbody>
                  {Object.entries(product.specs || {}).map(([key, value], index) => (
                    <tr key={index}>
                      <td className="fw-semibold text-secondary" style={{ width: '35%' }}>
                        {key}
                      </td>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab: Đánh giá */}
          {activeTab === 'reviews' && (
            <div className="text-center py-5">
              <i className="bi bi-chat-square-text fs-1 text-muted d-block mb-3"></i>
              <h5 className="text-muted">Chưa có đánh giá nào</h5>
              <p className="text-secondary small mb-3">Hãy là người đầu tiên đánh giá sản phẩm này</p>
              <button className="btn btn-outline-danger btn-sm">
                <i className="bi bi-pencil me-1"></i>Viết đánh giá
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* SẢN PHẨM LIÊN QUAN */}
      {/* ============================================================ */}
      {relatedProducts.length > 0 && (
        <div>
          <h4 className="fw-bold mb-3">
            <i className="bi bi-collection text-danger me-2"></i>Sản phẩm liên quan
          </h4>
          <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-lg-5">
            {relatedProducts.map(rp => (
               <div className="col" key={rp.id}>
                 <StoreProductCard product={rp} onAddToCart={handleAddRelatedToCart} sectionLabel="Lien quan" />
               </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </>
  );
}
