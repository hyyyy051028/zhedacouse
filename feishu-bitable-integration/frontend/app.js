// API 基础地址
const API_BASE_URL = 'http://localhost:3000/api';
// 生产环境请改为实际的后端地址
// const API_BASE_URL = 'https://your-domain.com/api';

// 表单提交处理
document.getElementById('registrationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // 表单验证
    if (!validateForm()) {
        return;
    }
    
    // 获取表单数据
    const formData = new FormData(this);
    const data = {};
    
    // 转换表单数据为对象
    formData.forEach((value, key) => {
        if (key === '是否缴费') {
            data[key] = true;
        } else {
            data[key] = value;
        }
    });
    
    // 处理复选框未选中情况
    if (!formData.has('是否缴费')) {
        data['是否缴费'] = false;
    }
    
    // 设置按钮加载状态
    setLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            // 显示成功弹窗
            showSuccessModal();
            // 重置表单
            this.reset();
        } else {
            showError(result.message || '提交失败，请稍后重试');
        }
    } catch (error) {
        console.error('提交错误:', error);
        showError('网络错误，请检查网络连接后重试');
    } finally {
        setLoading(false);
    }
});

// 表单验证
function validateForm() {
    let isValid = true;
    
    // 验证手机号
    const phone = document.getElementById('phone');
    const phoneError = document.getElementById('phoneError');
    const phonePattern = /^1[3-9]\d{9}$/;
    
    if (!phonePattern.test(phone.value)) {
        phone.classList.add('error');
        phoneError.textContent = '请输入正确的11位手机号';
        phoneError.classList.add('show');
        isValid = false;
    } else {
        phone.classList.remove('error');
        phoneError.classList.remove('show');
    }
    
    // 验证身份证
    const idCard = document.getElementById('idCard');
    const idCardError = document.getElementById('idCardError');
    
    if (!validateIdCard(idCard.value)) {
        idCard.classList.add('error');
        idCardError.textContent = '请输入正确的18位身份证号码';
        idCardError.classList.add('show');
        isValid = false;
    } else {
        idCard.classList.remove('error');
        idCardError.classList.remove('show');
    }
    
    return isValid;
}

// 身份证号码验证
function validateIdCard(idCard) {
    // 基础格式验证：18位，前17位数字，最后一位数字或X
    const pattern = /^\d{17}[\dXx]$/;
    if (!pattern.test(idCard)) {
        return false;
    }
    
    // 加权因子
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    // 校验码映射
    const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    
    let sum = 0;
    for (let i = 0; i < 17; i++) {
        sum += parseInt(idCard[i]) * weights[i];
    }
    
    const checkCode = checkCodes[sum % 11];
    return idCard[17].toUpperCase() === checkCode;
}

// 设置按钮加载状态
function setLoading(isLoading) {
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    if (isLoading) {
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
    } else {
        submitBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
    }
}

// 显示成功弹窗
function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'flex';
}

// 关闭弹窗
function closeModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'none';
}

// 显示错误提示
function showError(message) {
    const toast = document.getElementById('errorToast');
    const errorMsg = document.getElementById('errorMsg');
    
    errorMsg.textContent = message;
    toast.style.display = 'block';
    
    // 3秒后自动隐藏
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// 输入时实时验证
 document.getElementById('phone').addEventListener('input', function() {
    if (this.classList.contains('error')) {
        const phonePattern = /^1[3-9]\d{9}$/;
        if (phonePattern.test(this.value)) {
            this.classList.remove('error');
            document.getElementById('phoneError').classList.remove('show');
        }
    }
});

document.getElementById('idCard').addEventListener('input', function() {
    if (this.classList.contains('error')) {
        if (validateIdCard(this.value)) {
            this.classList.remove('error');
            document.getElementById('idCardError').classList.remove('show');
        }
    }
});

// 点击弹窗外部关闭
document.getElementById('successModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});
