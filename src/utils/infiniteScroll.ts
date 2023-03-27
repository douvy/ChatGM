export function addInfiniteScroll(container: HTMLElement | null): void {
    if (!container) {
        console.error('Container element is null');
        return;
    }

    const options = {
        root: container,
        rootMargin: '0px',
        threshold: 1.0,
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Load more content here
                // Then scroll to the bottom
                const lastChild = container.lastElementChild;
                alert("here");
                if (lastChild) {
                    lastChild.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }, options);

    const lastChild = container.lastElementChild;
    alert(lastChild);
    if (lastChild) {
        alert("observing");
        observer.observe(lastChild);
    }
}