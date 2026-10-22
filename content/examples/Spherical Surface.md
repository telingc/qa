---
id: example-griffiths4e-2-6
parent: superposition
---
# Spherical Surface
Find the electric field a distance $z$ from the center of a spherical surface of radius $R$ that carries a uniform charge density $\sigma$. Consider two cases:
1. $z<R$, inside the spherical surface.
2. $z>R$, outside the spherical surface.
Use direct source integration and express both results in terms of the total charge $q=4\pi R^2\sigma$. Book hint, restated: use the law of cosines for the source-to-observation distance and retain the positive square root; $\sqrt{(R-z)^2}=|R-z|$ takes different forms inside and outside.
### 1. Inside
Notice that for the inside case, we'll find an easier way using Gauss' law. For now we're using integral$$d\,\mathbf{E}=\frac{1}{4\pi\epsilon_0}\frac{dq}{s^2}\hat{\mathbf{s}}=\frac{1}{4\pi\epsilon_0}\frac{\sigma R^2\sin\theta \cdot d\phi\,d\theta}{R^2+z^2-2Rz\cos\theta}\hat{\mathbf{s}}$$Then we project to the z-axis and integrate is$$\mathbf{E}=\frac{\sigma R^2}{4\pi\epsilon_0}\int_{0}^{\pi}\int_{0}^{2\pi}\frac{\sin\theta(z-R\cos\theta) \cdot d\phi\,d\theta}{(R^2+z^2-2Rz\cos\theta)^{3/2}}\hat{\mathbf{z}}$$One possible solution is to let $t=-\cos\theta$ and get$$\mathbf{E}=\frac{\sigma R^2}{2\epsilon_0}\int_{-1}^1\frac{z+Rt}{(2Rz\cdot t+R^2+z^2)^{3/2}}dt\,\hat{\mathbf{z}}$$Then we again use substitution and let $u=2Rz\cdot t+R^2+z^2$ so that now we're calculating$$\mathbf{E}=\frac{\sigma R}{8\epsilon_0z^2}\int_{(R-z)^2}^{(R+z)^2}\frac{u-R^2+z^2}{u^{3/2}}du\,\hat{\mathbf{z}}$$Then we can infer that $\displaystyle \mathbf{E}=\mathbf{0}$ easily.

And notice, a subtle point is that$$
\sqrt{(R-z)^2}=|R-z|.  
$$For the interior case, where ($0<z<R$), we have ($|R-z|=R-z$). For the exterior case, where ($z>R$), we must instead use ($|R-z|=z-R$). This distinction is essential when evaluating the integral at its lower limit.

In conclusion, the underlying idea is straightforward, but the algebra requires some care.
### 2. Outside
The integral of the exterior case is the same$$\mathbf{E}=\frac{\sigma R}{8\epsilon_0z^2}\int_{(R-z)^2}^{(R+z)^2}\frac{u-R^2+z^2}{u^{3/2}}du\,\hat{\mathbf{z}}$$But now we're using $|R-z|=z-R$ instead, same calculation we get$$\mathbf{E}=\frac{\sigma R^2}{\epsilon_0z^2}\cdot\hat{\mathbf{z}}=\frac{q}{4\pi\epsilon_0z^2}\cdot\hat{\mathbf{z}}$$
### 3. Answer
Finally we have the answer:$$\mathbf{E}=\begin{cases}\mathbf{0},\quad\quad\qquad\,\,\,0\leqslant z< R\\\displaystyle\frac{q}{4\pi\epsilon_0z^2}\cdot\hat{\mathbf{z}},\,\,\, z>R\end{cases}$$You may notice that we're not mentioning the case $z=R$, good question. This is the *Boundary Condition*, a crucial topic we'll discuss later.
# Source
Griffiths, *Introduction to Electrodynamics*, 4th edition (2013), Problem 2.7, printed p. 65 (PDF p. 84).