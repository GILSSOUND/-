import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TERMS_TEXT = `** 해당 서식은 공정거래위원회에서 제공하는 전자상거래 표준 약관으로 쇼핑몰 운영형태에 따른 수정이 필요할 수 있습니다. 쇼핑몰에 적용하시기 전 쇼핑몰 운영 사항 등을 확인하시고 관련 법령 등을 감안하여 적절한 내용을 반영하여 이용하시기 바랍니다. **
 
제1조(목적)
이 약관은 길스컴퍼니(전자상거래 사업자)가 운영하는 길스몰(이하 “몰”이라 한다)에서 제공하는 인터넷 관련 서비스(이하 “서비스”라 한다)를 이용함에 있어 사이버 몰과 이용자의 권리․의무 및 책임사항을 규정함을 목적으로 합니다.
※「PC통신, 무선 등을 이용하는 전자상거래에 대해서도 그 성질에 반하지 않는 한 이 약관을 준용합니다.」
제2조(정의)
① “몰”이란 길스컴퍼니가 재화 또는 용역(이하 “재화 등”이라 함)을 이용자에게 제공하기 위하여 컴퓨터 등 정보통신설비를 이용하여 재화 등을 거래할 수 있도록 설정한 가상의 영업장을 말하며, 아울러 사이버몰을 운영하는 사업자의 의미로도 사용합니다.
② “이용자”란 “몰”에 접속하여 이 약관에 따라 “몰”이 제공하는 서비스를 받는 회원 및 비회원을 말합니다.
③ ‘회원’이라 함은 “몰”에 회원등록을 한 자로서, 계속적으로 “몰”이 제공하는 서비스를 이용할 수 있는 자를 말합니다.
④ ‘비회원’이라 함은 회원에 가입하지 않고 “몰”이 제공하는 서비스를 이용하는 자를 말합니다.
제3조 (약관 등의 명시와 설명 및 개정)
① “몰”은 이 약관의 내용과 상호 및 대표자 성명, 영업소 소재지 주소(소비자의 불만을 처리할 수 있는 곳의 주소를 포함), 전화번호․모사전송번호․전자우편주소, 사업자등록번호, 통신판매업 신고번호, 개인정보관리책임자등을 이용자가 쉽게 알 수 있도록 길스몰의 초기 서비스화면(전면)에 게시합니다. 다만, 약관의 내용은 이용자가 연결화면을 통하여 볼 수 있도록 할 수 있습니다.
② “몰은 이용자가 약관에 동의하기에 앞서 약관에 정하여져 있는 내용 중 청약철회․배송책임․환불조건 등과 같은 중요한 내용을 이용자가 이해할 수 있도록 별도의 연결화면 또는 팝업화면 등을 제공하여 이용자의 확인을 구하여야 합니다.
③ “몰”은 「전자상거래 등에서의 소비자보호에 관한 법률」, 「약관의 규제에 관한 법률」, 「전자문서 및 전자거래기본법」, 「전자금융거래법」, 「전자서명법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」, 「방문판매 등에 관한 법률」, 「소비자기본법」 등 관련 법을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.
④ “몰”이 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 몰의 초기화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다. 다만, 이용자에게 불리하게 약관내용을 변경하는 경우에는 최소한 30일 이상의 사전 유예기간을 두고 공지합니다.  이 경우 "몰“은 개정 전 내용과 개정 후 내용을 명확하게 비교하여 이용자가 알기 쉽도록 표시합니다.
⑤ “몰”이 약관을 개정할 경우에는 그 개정약관은 그 적용일자 이후에 체결되는 계약에만 적용되고 그 이전에 이미 체결된 계약에 대해서는 개정 전의 약관조항이 그대로 적용됩니다. 다만 이미 계약을 체결한 이용자가 개정약관 조항의 적용을 받기를 원하는 뜻을 제3항에 의한 개정약관의 공지기간 내에 “몰”에 송신하여 “몰”의 동의를 받은 경우에는 개정약관 조항이 적용됩니다.
⑥ 이 약관에서 정하지 아니한 사항과 이 약관의 해석에 관하여는 전자상거래 등에서의 소비자보호에 관한 법률, 약관의 규제 등에 관한 법률, 공정거래위원회가 정하는 전자상거래 등에서의 소비자 보호지침 및 관계법령 또는 상관례에 따릅니다.
제4조(서비스의 제공 및 변경)
① “몰”은 다음과 같은 업무를 수행합니다.
1. 재화 또는 용역에 대한 정보 제공 및 구매계약의 체결
2. 구매계약이 체결된 재화 또는 용역의 배송
3. 기타 “몰”이 정하는 업무
② “몰”은 재화 또는 용역의 품절 또는 기술적 사양의 변경 등의 경우에는 장차 체결되는 계약에 의해 제공할 재화 또는 용역의 내용을 변경할 수 있습니다. 이 경우에는 변경된 재화 또는 용역의 내용 및 제공일자를 명시하여 현재의 재화 또는 용역의 내용을 게시한 곳에 즉시 공지합니다.
③ “몰”이 제공하기로 이용자와 계약을 체결한 서비스의 내용을 재화등의 품절 또는 기술적 사양의 변경 등의 사유로 변경할 경우에는 그 사유를 이용자에게 통지 가능한 주소로 즉시 통지합니다.
④ 전항의 경우 “몰”은 이로 인하여 이용자가 입은 손해를 배상합니다. 다만, “몰”이 고의 또는 과실이 없음을 입증하는 경우에는 그러하지 아니합니다.
제5조(서비스의 중단)
① “몰”은 컴퓨터 등 정보통신설비의 보수점검․교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.
② “몰”은 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 이용자 또는 제3자가 입은 손해에 대하여 배상합니다. 단, “몰”이 고의 또는 과실이 없음을 입증하는 경우에는 그러하지 아니합니다.
③ 사업종목의 전환, 사업의 포기, 업체 간의 통합 등의 이유로 서비스를 제공할 수 없게 되는 경우에는 “몰”은 제8조에 정한 방법으로 이용자에게 통지하고 당초 “몰”에서 제시한 조건에 따라 소비자에게 보상합니다. 다만, “몰”이 보상기준 등을 고지하지 아니한 경우에는 이용자들의 마일리지 또는 적립금 등을 “몰”에서 통용되는 통화가치에 상응하는 현물 또는 현금으로 이용자에게 지급합니다.
제6조(회원가입)
① 이용자는 “몰”이 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다.
② “몰”은 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다.
1. 가입신청자가 이 약관 제7조제3항에 의하여 이전에 회원자격을 상실한 적이 있는 경우, 다만 제7조제3항에 의한 회원자격 상실 후 3년이 경과한 자로서 “몰”의 회원재가입 승낙을 얻은 경우에는 예외로 한다.
2. 등록 내용에 허위, 기재누락, 오기가 있는 경우
3. 기타 회원으로 등록하는 것이 “몰”의 기술상 현저히 지장이 있다고 판단되는 경우
③ 회원가입계약의 성립 시기는 “몰”의 승낙이 회원에게 도달한 시점으로 합니다.
④ 회원은 회원가입 시 등록한 사항에 변경이 있는 경우, 상당한 기간 이내에 “몰”에 대하여 회원정보 수정 등의 방법으로 그 변경사항을 알려야 합니다.
제7조(회원 탈퇴 및 자격 상실 등)
① 회원은 “몰”에 언제든지 탈퇴를 요청할 수 있으며 “몰”은 즉시 회원탈퇴를 처리합니다.
② 회원이 다음 각 호의 사유에 해당하는 경우, “몰”은 회원자격을 제한 및 정지시킬 수 있습니다.
1. 가입 신청 시에 허위 내용을 등록한 경우
2. “몰”을 이용하여 구입한 재화 등의 대금, 기타 “몰”이용에 관련하여 회원이 부담하는 채무를 기일에 지급하지 않는 경우
3. 다른 사람의 “몰” 이용을 방해하거나 그 정보를 도용하는 등 전자상거래 질서를 위협하는 경우
4. “몰”을 이용하여 법령 또는 이 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우
③ “몰”이 회원 자격을 제한․정지 시킨 후, 동일한 행위가 2회 이상 반복되거나 30일 이내에 그 사유가 시정되지 아니하는 경우 “몰”은 회원자격을 상실시킬 수 있습니다.
④ “몰”이 회원자격을 상실시키는 경우에는 회원등록을 말소합니다. 이 경우 회원에게 이를 통지하고, 회원등록 말소 전에 최소한 30일 이상의 기간을 정하여 소명할 기회를 부여합니다.
제8조(회원에 대한 통지)
① “몰”이 회원에 대한 통지를 하는 경우, 회원이 “몰”과 미리 약정하여 지정한 전자우편 주소로 할 수 있습니다.
② “몰”은 불특정다수 회원에 대한 통지의 경우 1주일이상 “몰” 게시판에 게시함으로서 개별 통지에 갈음할 수 있습니다. 다만, 회원 본인의 거래와 관련하여 중대한 영향을 미치는 사항에 대하여는 개별통지를 합니다.
제9조(구매신청 및 개인정보 제공 동의 등)
① “몰”이용자는 “몰”상에서 다음 또는 이와 유사한 방법에 의하여 구매를 신청하며, “몰”은 이용자가 구매신청을 함에 있어서 다음의 각 내용을 알기 쉽게 제공하여야 합니다.
  1. 재화 등의 검색 및 선택
  2. 받는 사람의 성명, 주소, 전화번호, 전자우편주소(또는 이동전화번호) 등의 입력
  3. 약관내용, 청약철회권이 제한되는 서비스, 배송료․설치비 등의 비용부담과 관련한 내용에 대한 확인
  4. 이 약관에 동의하고 위 3.호의 사항을 확인하거나 거부하는 표시
  5. 재화등의 구매신청 및 이에 관한 확인 또는 “몰”의 확인에 대한 동의
  6. 결제방법의 선택
② “몰”이 제3자에게 구매자 개인정보를 제공할 필요가 있는 경우 1) 개인정보를 제공받는 자, 2)개인정보를 제공받는 자의 개인정보 이용목적, 3) 제공하는 개인정보의 항목, 4) 개인정보를 제공받는 자의 개인정보 보유 및 이용기간을 구매자에게 알리고 동의를 받아야 합니다. 
③ “몰”이 제3자에게 구매자의 개인정보를 취급할 수 있도록 업무를 위탁하는 경우에는 1) 개인정보 취급위탁을 받는 자, 2) 개인정보 취급위탁을 하는 업무의 내용을 구매자에게 알리고 동의를 받아야 합니다. 다만, 서비스제공에 관한 계약이행을 위해 필요하고 구매자의 편의증진과 관련된 경우에는 고지절차와 동의절차를 거치지 않아도 됩니다.
제10조 (계약의 성립)
①  “몰”은 제9조와 같은 구매신청에 대하여 다음 각 호에 해당하면 승낙하지 않을 수 있습니다.
1. 신청 내용에 허위, 기재누락, 오기가 있는 경우
2. 미성년자가 구매하는 경우 법정대리인의 동의가 없는 경우
3. 기타 구매신청에 승낙하는 것이 “몰” 기술상 현저히 지장이 있다고 판단하는 경우
② “몰”의 승낙이 수신확인통지형태로 이용자에게 도달한 시점에 계약이 성립한 것으로 봅니다.
제11조(지급방법) 
“몰”에서 구매한 재화 또는 용역에 대한 대금지급방법은 계좌이체, 카드 결제, 무통장입금 등으로 할 수 있습니다.
제12조(수신확인통지․구매신청 변경 및 취소)
“몰”은 배송 전에 이용자의 취소 요청이 있는 경우에는 지체 없이 그 요청에 따라 처리하여야 합니다.
제13조(재화 등의 공급)
“몰”은 이용자가 구매한 재화에 대해 배송수단, 배송비용 부담자, 배송기간 등을 명시합니다.
제14조(환급)
“몰”은 품절 등의 사유로 제공을 할 수 없을 때에는 지체 없이 통지하고 환급 조치를 취합니다.
제15조(청약철회 등)
수령 후 7일 이내에는 청약철회가 가능하나, 훼손되거나 가치가 감소한 경우 불가할 수 있습니다.
제16조(개인정보보호)
“몰”은 최소한의 개인정보를 수집하며, 동의 없이 제3자에게 제공하지 않습니다.

부 칙(시행일) 이 약관은 2025년 1월 1일부터 시행합니다.`;

const PRIVACY_TEXT = `** 본 양식은 쇼핑몰 운영에 도움을 드리고자 샘플로 제공되는 서식으로 쇼핑몰 운영형태에 따른 수정이 필요합니다. 쇼핑몰에 적용하시기 전, 쇼핑몰 운영 사항 등을 확인하시고 적절한 내용을 반영하여 사용하시기 바랍니다. **

1. 개인정보 수집목적 및 이용목적

가. 서비스 제공에 관한 계약 이행 및 서비스 제공에 따른 요금정산
콘텐츠 제공 , 구매 및 요금 결제 , 물품배송 또는 청구지 등 발송 , 금융거래 본인 인증 및 금융 서비스

나. 회원 관리
회원제 서비스 이용에 따른 본인확인 , 개인 식별 , 불량회원의 부정 이용 방지와 비인가 사용 방지 , 가입 의사 확인 , 연령확인 , 만14세 미만 아동 개인정보 수집 시 법정 대리인 동의여부 확인, 불만처리 등 민원처리 , 고지사항 전달

2. 수집하는 개인정보 항목 : 이름 , 로그인ID , 비밀번호 , 이메일 , 14세미만 가입자의 경우 법정대리인의 정보

3. 개인정보의 보유기간 및 이용기간

원칙적으로, 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다.

가. 길스컴퍼니 방침에 의한 정보 보유 사유
o 부정거래 방지 및 쇼핑몰 운영방침에 따른 보관 : 1년

나. 관련 법령에 의한 정보보유 사유
o 계약 또는 청약철회 등에 관한 기록
-보존이유 : 전자상거래등에서의소비자보호에관한법률
-보존기간 : 5년

o 대금 결제 및 재화 등의 공급에 관한 기록
-보존이유: 전자상거래등에서의소비자보호에관한법률
-보존기간 : 5년

o 소비자 불만 또는 분쟁처리에 관한 기록
-보존이유 : 전자상거래등에서의소비자보호에관한법률
-보존기간 : 3년

o 로그 기록
-보존이유: 통신비밀보호법
-보존기간 : 3개월

※ 동의를 거부할 수 있으나 거부시 회원 가입이 불가능합니다.`;

const SNS_TEXT = `할인쿠폰 및 혜택, 이벤트, 신상품 소식 등 쇼핑몰에서 제공하는 유익한 쇼핑정보를 SMS나 이메일로 받아보실 수 있습니다.

단, 주문/거래 정보 및 주요 정책과 관련된 내용은 수신동의 여부와 관계없이 발송됩니다.

선택 약관에 동의하지 않으셔도 회원가입은 가능하며, 회원가입 후 회원정보수정 페이지에서 언제든지 수신여부를 변경하실 수 있습니다.`;

const RegisterPage = ({ showToast }) => {
  const navigate = useNavigate();
  const { register, login } = useAuth();
  
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
    passwordConfirm: '',
    name: '',
    phone: '',
    email: '',
  });

  const [agreements, setAgreements] = useState({
    all: false,
    terms: false,
    privacy: false,
    sns: false
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isSnsModalOpen, setIsSnsModalOpen] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAgreementChange = (e) => {
    const { name, checked } = e.target;
    if (name === 'all') {
      setAgreements({
        all: checked,
        terms: checked,
        privacy: checked,
        sns: checked
      });
    } else {
      const newAgreements = { ...agreements, [name]: checked };
      newAgreements.all = newAgreements.terms && newAgreements.privacy && newAgreements.sns;
      setAgreements(newAgreements);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.loginId) return setError('아이디를 입력해주세요.');
    if (!/^[a-zA-Z0-9]+$/.test(formData.loginId)) return setError('아이디는 영문과 숫자만 사용 가능합니다.');
    if (formData.password.length < 10) return setError('비밀번호는 10자리 이상이어야 합니다.');
    if (formData.password !== formData.passwordConfirm) return setError('비밀번호가 일치하지 않습니다.');
    if (!formData.name) return setError('이름을 입력해주세요.');
    if (!formData.phone) return setError('전화번호를 입력해주세요.');
    if (!formData.email) return setError('이메일을 입력해주세요.');
    if (!agreements.terms) return setError('이용약관에 동의해야 합니다.');
    if (!agreements.privacy) return setError('개인정보 수집 및 이용에 동의해야 합니다.');

    setLoading(true);
    const res = await register({
      loginId: formData.loginId,
      password: formData.password,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      agreements: {
        privacy: agreements.privacy,
        sns: agreements.sns
      }
    });
    setLoading(false);

    if (res.success) {
      await login(formData.loginId, formData.password);
      if (showToast) showToast('로그인되었습니다!');
      navigate('/');
    } else {
      setError(res.error);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '8rem auto 4rem auto', padding: '0 1rem', fontFamily: '"Jua", "Pretendard", sans-serif' }}>
      <h2 style={{ textAlign: 'center', fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '2rem' }}>회원가입</h2>
      
      {error && <div style={{ background: '#fdf2f2', color: '#e74c3c', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* 아이디 */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '1.1rem' }}>아이디 (영문/숫자) <span style={{color: '#ff4757'}}>*</span></label>
          <div style={{ position: 'relative' }}>
            <input type="text" name="loginId" value={formData.loginId} onChange={handleChange} style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #ddd', borderRadius: '8px', outline: 'none', fontFamily: '"Jua", sans-serif', fontSize: '1.1rem' }} />
          </div>
        </div>

        {/* 비밀번호 */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '1.1rem' }}>비밀번호 <span style={{color: '#ff4757'}}>*</span></label>
          <div style={{ position: 'relative' }}>
            <input type="password" name="password" value={formData.password} onChange={handleChange} style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #ddd', borderRadius: '8px', outline: 'none', fontFamily: '"Jua", sans-serif', fontSize: '1.1rem' }} />
          </div>
          <div style={{fontSize: '0.85rem', color: '#999', marginTop: '6px', letterSpacing: '-0.5px'}}>(영문/대소문자/특수문자 중 2가지 이상조합. 10자~16자)</div>
        </div>

        {/* 비밀번호 확인 */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '1.1rem' }}>비밀번호 확인 <span style={{color: '#ff4757'}}>*</span></label>
          <div style={{ position: 'relative' }}>
            <input type="password" name="passwordConfirm" value={formData.passwordConfirm} onChange={handleChange} style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #ddd', borderRadius: '8px', outline: 'none', fontFamily: '"Jua", sans-serif', fontSize: '1.1rem' }} />
          </div>
        </div>

        {/* 이름 */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '1.1rem' }}>이름 <span style={{color: '#ff4757'}}>*</span></label>
          <div style={{ position: 'relative' }}>
            <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #ddd', borderRadius: '8px', outline: 'none', fontFamily: '"Jua", sans-serif', fontSize: '1.1rem' }} />
          </div>
        </div>

        {/* 전화번호 */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '1.1rem' }}>전화번호 <span style={{color: '#ff4757'}}>*</span></label>
          <div style={{ position: 'relative' }}>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #ddd', borderRadius: '8px', outline: 'none', fontFamily: '"Jua", sans-serif', fontSize: '1.1rem' }} />
          </div>
        </div>

        {/* 이메일 */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '1.1rem' }}>이메일 <span style={{color: '#ff4757'}}>*</span></label>
          <div style={{ position: 'relative' }}>
            <input type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #ddd', borderRadius: '8px', outline: 'none', fontFamily: '"Jua", sans-serif', fontSize: '1.1rem' }} />
          </div>
        </div>

        {/* 약관 동의 */}
        <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid #eee', borderRadius: '8px', background: '#fafafa' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', marginBottom: '1rem', paddingBottom: '0.8rem', borderBottom: '1px solid #ddd', cursor: 'pointer' }}>
            <input type="checkbox" name="all" checked={agreements.all} onChange={handleAgreementChange} style={{ width: '18px', height: '18px' }} />
            약관 전체 동의
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#555', cursor: 'pointer' }}>
                <input type="checkbox" name="terms" checked={agreements.terms} onChange={handleAgreementChange} style={{ width: '16px', height: '16px' }} />
                [필수] 이용약관 동의
              </label>
              <button type="button" onClick={() => setIsTermsModalOpen(true)} style={{ background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.85rem', cursor: 'pointer', color: '#666', fontFamily: '"Jua", sans-serif' }}>[내용확인]</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#555', cursor: 'pointer' }}>
                <input type="checkbox" name="privacy" checked={agreements.privacy} onChange={handleAgreementChange} style={{ width: '16px', height: '16px' }} />
                [필수] 개인정보 수집 및 이용 동의
              </label>
              <button type="button" onClick={() => setIsPrivacyModalOpen(true)} style={{ background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.85rem', cursor: 'pointer', color: '#666', fontFamily: '"Jua", sans-serif' }}>[내용확인]</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#555', cursor: 'pointer' }}>
                <input type="checkbox" name="sns" checked={agreements.sns} onChange={handleAgreementChange} style={{ width: '16px', height: '16px' }} />
                [선택] SMS/이메일 마케팅 수신 동의
              </label>
              <button type="button" onClick={() => setIsSnsModalOpen(true)} style={{ background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.85rem', cursor: 'pointer', color: '#666', fontFamily: '"Jua", sans-serif' }}>[내용확인]</button>
            </div>
          </div>
        </div>

        {/* 가입 버튼 */}
        <button type="submit" disabled={loading} style={{ marginTop: '1rem', padding: '1rem', background: loading ? '#ccc' : '#000', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: '"Jua", sans-serif' }}>
          {loading ? '가입 중...' : '가입하기'}
        </button>
      </form>

      {/* 약관 모달 */}
      {isTermsModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', width: '90%', maxWidth: '600px', height: '80vh', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem' }}>길스몰 이용약관</h3>
              <button type="button" onClick={() => setIsTermsModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.8rem', cursor: 'pointer', lineHeight: '1' }}>&times;</button>
            </div>
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, fontSize: '0.95rem', lineHeight: '1.7', color: '#444', whiteSpace: 'pre-wrap', fontFamily: 'sans-serif' }}>
              {TERMS_TEXT}
            </div>
            <div style={{ padding: '1rem', borderTop: '1px solid #eee', textAlign: 'center', background: '#f8f9fa' }}>
              <button type="button" onClick={() => setIsTermsModalOpen(false)} style={{ padding: '0.8rem 3rem', background: '#000', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontFamily: '"Jua", sans-serif' }}>확인</button>
            </div>
          </div>
        </div>
      )}
      {/* 개인정보 모달 */}
      {isPrivacyModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', width: '90%', maxWidth: '600px', height: '80vh', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem' }}>길스몰 개인정보 수집 및 이용 동의</h3>
              <button type="button" onClick={() => setIsPrivacyModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.8rem', cursor: 'pointer', lineHeight: '1' }}>&times;</button>
            </div>
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, fontSize: '0.95rem', lineHeight: '1.7', color: '#444', whiteSpace: 'pre-wrap', fontFamily: 'sans-serif' }}>
              {PRIVACY_TEXT}
            </div>
            <div style={{ padding: '1rem', borderTop: '1px solid #eee', textAlign: 'center', background: '#f8f9fa' }}>
              <button type="button" onClick={() => setIsPrivacyModalOpen(false)} style={{ padding: '0.8rem 3rem', background: '#000', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontFamily: '"Jua", sans-serif' }}>확인</button>
            </div>
          </div>
        </div>
      )}
      
      {/* SNS/마케팅 모달 */}
      {isSnsModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', width: '90%', maxWidth: '600px', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem' }}>마케팅 정보 수신 동의</h3>
              <button type="button" onClick={() => setIsSnsModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.8rem', cursor: 'pointer', lineHeight: '1' }}>&times;</button>
            </div>
            <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: '50vh', fontSize: '0.95rem', lineHeight: '1.7', color: '#444', whiteSpace: 'pre-wrap', fontFamily: 'sans-serif' }}>
              {SNS_TEXT}
            </div>
            <div style={{ padding: '1rem', borderTop: '1px solid #eee', textAlign: 'center', background: '#f8f9fa' }}>
              <button type="button" onClick={() => setIsSnsModalOpen(false)} style={{ padding: '0.8rem 3rem', background: '#000', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontFamily: '"Jua", sans-serif' }}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
