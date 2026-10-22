---
id: example-griffiths4e-2-5
parent: superposition
---
# Charged Ring & Charged Disk
1. Find the electric field a distance $z$ above the center of a circular loop of radius $R$ that carries a uniform line charge $\lambda$.
2. Find the electric field a distance $z$ above the center of a flat circular disk of radius $R$ that carries a uniform surface charge $\sigma$. What does your formula give in the limit $R\to\infty$? Also check the case $z\gg R$.
### 1. Circular Loop
Intuitively, we can say that there's no horizontal field on the point, for this conclusion we have an complete explain of its symmetry. For now we take this as known, thus we only take vertical field into consideration. By drawing the graph, we can infer that:$$d\,\mathbf{E}_{\perp}=\frac{1}{4\pi\epsilon_0}\frac{dq}{s^2}\cdot\cos\theta\,\hat{\mathbf{n}},\,\cos\theta=\frac{z}{s},\,dq=\lambda R\cdot d\theta,\, s=\sqrt{R^2+z^2}$$Then we integrate the field vertically, since the direction of the net field is known, we just need the magnitude of the field $|\mathbf{E}|$.$$d\,E_\perp=\frac{1}{4\pi\epsilon_0}\frac{\lambda Rz\cdot d\theta}{(R^2+z^2)^{3/2}}\Rightarrow E=\frac{1}{4\pi\epsilon_0}\int_0^{2\pi}\frac{\lambda Rz\cdot d\theta}{(R^2+z^2)^{3/2}}=\frac{\lambda Rz}{2\epsilon_0(R^2+z^2)^{3/2}}$$Then we have the answer:$\displaystyle \frac{\lambda R\mathbf{z}}{2\epsilon_0(R^2+z^2)^{3/2}}$.
### 2. Circular Disk
To calculate circular disk which is an area version of the circular loop, we're using the surface charge $\sigma$.$$d\,\mathbf{E}_{\perp}=\frac{1}{4\pi\epsilon_0}\frac{dq}{s^2}\cdot\cos\theta\,\hat{\mathbf{n}},\,\cos\theta=\frac{z}{s},\,dq=\sigma r\cdot d\theta dr,\, s=\sqrt{r^2+z^2}$$Similarly, we integrate.$$d\,E_\perp=\frac{1}{4\pi\epsilon_0}\frac{\sigma rz\cdot d\theta dr}{(r^2+z^2)^{3/2}}\Rightarrow E=\frac{\sigma z}{2\epsilon_0}\int_0^R\frac{r\cdot dr}{(r^2+z^2)^{3/2}}$$To calculate this integral, we'll need tricks like this: $2r\cdot dr=d(r^2+z^2)$, thus we let $u=r^2+z^2$, then we have$$\mathbf{E}=\frac{\sigma z}{2\epsilon_0}\int_0^R\frac{r\cdot dr\hat{\mathbf{z}}}{(r^2+z^2)^{3/2}}=\frac{\sigma z}{4\epsilon_0}\int_0^{R^2+z^2}u^{-3/2}du\,\hat{\mathbf{z}}=\frac{\sigma}{2\epsilon_0}(1-\frac{z}{\sqrt{R^2+z^2}})\hat{\mathbf{z}}$$Then the answer is $\displaystyle \frac{\sigma}{2\epsilon_0}(1-\frac{z}{\sqrt{R^2+z^2}})\hat{\mathbf{z}}$.
# Source
Griffiths, *Introduction to Electrodynamics*, 4th edition (2013), Problems 2.5 and 2.6, printed p. 65 (PDF p. 84).
