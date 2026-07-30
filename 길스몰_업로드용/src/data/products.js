export const storeConfig = {
  storeName: "길스몰",
  slogan: "맛과 가성비를 동시에! 길스몰 밀키트",
  mainBanner: {
    title: "주말 특가전 최대 50% 할인!",
    subtitle: "지금 가입하고 첫 구매 혜택을 누리세요.",
    imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=1200&h=400",
  },
};

// 카테고리 매핑: mealkit(밀키트), local(산지직송), direct(업체직송)
export const products = [
  { id: 1, name: "얼큰 소고기 버섯 전골 (2~3인분)", category: "mealkit", originalPrice: 24000, price: 15900, discount: "33%", imageUrl: "https://images.unsplash.com/photo-1548943487-a2e4b43b485f?auto=format&fit=crop&q=80&w=600", isNew: true, isBest: true },
  { id: 2, name: "매콤달콤 춘천 닭갈비 (2인분)", category: "mealkit", originalPrice: 18000, price: 11900, discount: "33%", imageUrl: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=600", isNew: false, isBest: true },
  { id: 3, name: "깊은 맛 사골 부대찌개 (3인분)", category: "mealkit", originalPrice: 21000, price: 14900, discount: "29%", imageUrl: "https://images.unsplash.com/photo-1626804475297-41607ea0d5eb?auto=format&fit=crop&q=80&w=600", isNew: false, isBest: false },
  { id: 4, name: "정통 이탈리안 까르보나라 파스타 (2인분)", category: "mealkit", originalPrice: 16000, price: 9900, discount: "38%", imageUrl: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80&w=600", isNew: true, isBest: false },
  
  { id: 5, name: "제주 산지직송 딱새우회 (20미)", category: "local", originalPrice: 35000, price: 24900, discount: "28%", imageUrl: "https://images.unsplash.com/photo-1544025162-831620c54178?auto=format&fit=crop&q=80&w=600", isNew: true, isBest: true },
  { id: 6, name: "해남 꿀고구마 한박스 (5kg)", category: "local", originalPrice: 15000, price: 12900, discount: "14%", imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=600", isNew: false, isBest: false },
  { id: 7, name: "통영 신선 생굴 (1kg)", category: "local", originalPrice: 22000, price: 18900, discount: "14%", imageUrl: "https://images.unsplash.com/photo-1544025162-831620c54178?auto=format&fit=crop&q=80&w=600", isNew: true, isBest: false },
  { id: 8, name: "청송 꿀사과 (3kg)", category: "local", originalPrice: 28000, price: 22000, discount: "21%", imageUrl: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80&w=600", isNew: false, isBest: true },
  
  { id: 9, name: "[브랜드직송] 무항생제 1등급 삼겹살 (500g)", category: "direct", originalPrice: 19000, price: 14500, discount: "23%", imageUrl: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=600", isNew: true, isBest: true },
  { id: 10, name: "[브랜드직송] 프리미엄 떡갈비 세트 (10입)", category: "direct", originalPrice: 32000, price: 19900, discount: "37%", imageUrl: "https://images.unsplash.com/photo-1548943487-a2e4b43b485f?auto=format&fit=crop&q=80&w=600", isNew: false, isBest: false },
  { id: 11, name: "[업체직송] 춘천 명물 닭갈비 밀키트 (1kg)", category: "direct", originalPrice: 25000, price: 18900, discount: "24%", imageUrl: "https://images.unsplash.com/photo-1626804475297-41607ea0d5eb?auto=format&fit=crop&q=80&w=600", isNew: true, isBest: false },
  { id: 12, name: "[업체직송] 부산 어묵 모듬 세트 (1kg)", category: "direct", originalPrice: 14000, price: 9900, discount: "29%", imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=600", isNew: false, isBest: true }
];
