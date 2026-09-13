const fs = require('fs');

const path = 'c:/Users/kimsj/Desktop/songildong/gilsmall/src/pages/Admin.jsx';
const lines = fs.readFileSync(path, 'utf8').split('\n');

const fix = `  const [chargePointsAmount, setChargePointsAmount] = useState('');
  
  // 주문 관리 페이지네이션 및 상세 모달 상태
  const [currentOrdersPage, setCurrentOrdersPage] = useState(1);
  const ordersPerPage = 10;
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  
  // 주문 서브탭 상태
  const [orderSubTab, setOrderSubTab] = useState('결제완료');
  const [claimsSubTab, setClaimsSubTab] = useState('취소관리');
  const [trackingInputs, setTrackingInputs] = useState({});
  const defaultEndDate = new Date().toISOString().split('T')[0];
  const defaultStartDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [orderStartDate, setOrderStartDate] = useState(defaultStartDate);
  const [orderEndDate, setOrderEndDate] = useState(defaultEndDate);

  // 품절 관리 모달 상태
  const [stockModalProduct, setStockModalProduct] = useState(null);
  const [stockOptions, setStockOptions] = useState([]);
  const [isAllSoldOut, setIsAllSoldOut] = useState(false);

  // 기본 폼
  const initialFormData = {
    name: '',
    subtitle: '',
    category: 'mealkit',
    originalPrice: '',
    price: '',
    shippingFee: 3000,
    isNewProduct: false,
    isBest: false
  };

  // 폼 상태
  const [formData, setFormData] = useState(initialFormData);
`;

const insertIndex = lines.findIndex(l => l.includes("const [userOrderEndDate, setUserOrderEndDate] = useState('');")) + 1;
lines.splice(insertIndex, 0, ...fix.split('\n'));

fs.writeFileSync(path, lines.join('\n'));
console.log('Fixed Admin.jsx');
