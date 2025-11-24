import Dashboard from './lib/dashboard.svelte'
import { initInterceptor } from './core/interceptor'
import { mount } from 'svelte'

// 1. 启动拦截核心
initInterceptor();

// 2. 挂载 Svelte 应用到 document.body
const app = mount(Dashboard, {
  target: document.body,
});

export default app;

// ... 下面的测试按钮逻辑保持不变 ...

const testBtn = document.createElement('button');
testBtn.textContent = "测试：请求 /todos/1";
testBtn.style.position = "fixed";
testBtn.style.bottom = "20px";
testBtn.style.left = "20px";
document.body.appendChild(testBtn);

testBtn.onclick = async () => {
  console.log("业务代码发起请求...");
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/todos/1');
    const data = await res.json();
    alert(`收到响应数据:\n${JSON.stringify(data, null, 2)}`);
  } catch (e) {
    alert('请求失败');
  }
};