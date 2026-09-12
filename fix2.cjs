const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.jsx', 'utf8');

const regex = /detailBlocks: processedBlocks[\s\S]*?alert\([^\)]*\);/g;
const matches = content.match(regex);
console.log("Matches:", matches);

if (matches) {
  content = content.replace(matches[0], 
    "detailBlocks: processedBlocks\n      };\n\n      if (editingProductId) {\n        await updateProduct(editingProductId, productPayload);\n        alert(\"상품이 성공적으로 수정되었습니다.\");\n      } else {\n        await createProduct(productPayload);\n        alert(\"상품이 성공적으로 등록되었습니다.\");\n      }\n      \n      if (refreshGlobalProducts) refreshGlobalProducts();\n      loadProducts();\n      resetForm();\n      setActiveTab('list');\n      \n    } catch (error) {\n      console.error('Submit Error Detailed:', error);\n      let detailMsg = error.message;\n      if (error.response) {\n        detailMsg += '\\\\nStatus: ' + error.response.status;\n        detailMsg += '\\\\nData: ' + JSON.stringify(error.response.data);\n      }\n      alert('[상세 오류 정보]\\\\n메시지: ' + error.message + '\\\\n상세: ' + detailMsg);\n    } finally {\n      setUploading(false);\n    }\n  };\n\n  const handleDelete = async (id) => {\n    if (window.confirm(\"정말 이 상품을 삭제하시겠습니까?\")) {\n      try {\n        setProducts(prev => prev.filter(p => (p._id || p.id) !== id));\n        await deleteProduct(id);\n        alert(\"삭제되었습니다.\");"
  );
  fs.writeFileSync('src/pages/Admin.jsx', content);
  console.log("Replaced successfully!");
}
