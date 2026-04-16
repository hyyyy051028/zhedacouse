// 表单验证和提交逻辑

// 身份证号码验证函数
function validateIdCard(idCard) {
    const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    if (!reg.test(idCard)) {
        return false;
    }
    return true;
}

// 手机号验证函数
function validatePhone(phone) {
    const reg = /^1[3-9]\d{9}$/;
    return reg.test(phone);
}

// 表单验证
function validateForm() {
    let isValid = true;
    
    // 手机号验证
    const phone = document.getElementById('phone').value;
    const phoneError = document.getElementById('phoneError');
    if (!validatePhone(phone)) {
        phoneError.textContent = '请输入正确的手机号码';
        isValid = false;
    } else {
        phoneError.textContent = '';
    }
    
    // 身份证验证
    const idCard = document.getElementById('idCard').value;
    const idCardError = document.getElementById('idCardError');
    if (!validateIdCard(idCard)) {
        idCardError.textContent = '请输入正确的身份证号码';
        isValid = false;
    } else {
        idCardError.textContent = '';
    }
    
    // 其他必填字段验证
    const requiredFields = ['name', 'admissionTeacher', 'position', 'education', 'company', 'industry', 'companySize', 'managementYears', 'annualSales', 'program'];
    requiredFields.forEach(field => {
        const element = document.getElementById(field);
        if (!element.value) {
            isValid = false;
            // 可以在这里添加错误提示
        }
    });
    
    return isValid;
}

// 重置表单
function resetForm() {
    document.getElementById('registrationForm').reset();
    document.getElementById('phoneError').textContent = '';
    document.getElementById('idCardError').textContent = '';
}

// 表单提交处理
document.getElementById('registrationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 验证表单
    if (!validateForm()) {
        return;
    }
    
    // 收集表单数据
    const formData = new FormData(this);
    const data = {};
    
    formData.forEach((value, key) => {
        data[key] = value;
    });
    
    // 处理复选框
    data.isPaid = document.getElementById('isPaid').checked;
    
    // 显示加载状态
    const submitButton = this.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.innerHTML = '<span class="loading"></span> 提交中...';
    submitButton.disabled = true;
    
    // 调用后端API
    fetch('http://localhost:3000/api/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('网络响应错误');
        }
        return response.json();
    })
    .then(result => {
        // 显示成功提示
        const formCard = document.querySelector('.form-card');
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = '报名成功！我们将尽快与您联系。';
        formCard.insertBefore(successMessage, formCard.firstChild);
        
        // 重置表单
        resetForm();
        
        // 3秒后移除成功提示
        setTimeout(() => {
            successMessage.remove();
        }, 3000);
    })
    .catch(error => {
        // 显示错误提示
        const formCard = document.querySelector('.form-card');
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message-box';
        errorMessage.textContent = '提交失败，请稍后重试。';
        formCard.insertBefore(errorMessage, formCard.firstChild);
        
        // 3秒后移除错误提示
        setTimeout(() => {
            errorMessage.remove();
        }, 3000);
        
        console.error('错误:', error);
    })
    .finally(() => {
        // 恢复按钮状态
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    });
});

// 表单输入实时验证
document.getElementById('phone').addEventListener('input', function() {
    const phone = this.value;
    const phoneError = document.getElementById('phoneError');
    if (phone && !validatePhone(phone)) {
        phoneError.textContent = '请输入正确的手机号码';
    } else {
        phoneError.textContent = '';
    }
});

document.getElementById('idCard').addEventListener('input', function() {
    const idCard = this.value;
    const idCardError = document.getElementById('idCardError');
    if (idCard && !validateIdCard(idCard)) {
        idCardError.textContent = '请输入正确的身份证号码';
    } else {
        idCardError.textContent = '';
    }
});