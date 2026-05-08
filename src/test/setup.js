import '@testing-library/jest-dom';

global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
};

global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
};
