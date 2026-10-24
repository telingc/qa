---
id: example-griffiths4e-2-27
parent: electric-potential
---
> It's a Calculus problem actually.
## Question
A solid cylinder of length $L$ and radius $R$ carries uniform volume charge density $\rho$. Its center is the origin and its axis is the $z$ axis, so the source occupies $-L/2\leq z'\leq L/2$ and $0\leq s'\leq R$. Choose $V(\infty)=0$. The observation point lies on the axis beyond the cylinder's upper end, at $(0,0,z)$ with $z>L/2$.
1. Calculate the potential at this point by integrating over the charged volume.
2. Use the potential to obtain the electric field at the same point, including its direction.
### 1. Source Integral for the Potential
Similarly we integrate using the cylinder coordinates, and the differentiate is $dq=\rho s' ds' d\theta dz'$:$$\begin{aligned} V(z) &=\frac{\rho}{4\pi\epsilon_0} \int_{-L/2}^{L/2}\int_0^{2\pi}\int_0^R \frac{s'\,ds'\,d\theta\,dz'} {\sqrt{(z-z')^2+s'^2}}\\ &=\frac{\rho}{2\epsilon_0} \int_{-L/2}^{L/2}\int_0^R \frac{s'\,ds'\,dz'} {\sqrt{(z-z')^2+s'^2}}\\&=\frac{\rho}{2\epsilon_0} \int_{-L/2}^{L/2} \left[\sqrt{(z-z')^2+R^2}-(z-z')\right]dz'\end{aligned}$$And the final result is literally a bunch of things.$$\begin{align*}\text{When}\quad a&=z-\frac{L}{2}\\b&=z+\frac{L}{2},\\V(z)&=\frac{\rho}{4\epsilon_0} \left[ b\sqrt{b^2+R^2}-a\sqrt{a^2+R^2} +R^2\ln\frac{b+\sqrt{b^2+R^2}}{a+\sqrt{a^2+R^2}} -2zL \right]\end{align*}$$
## Source
Griffiths, *Introduction to Electrodynamics*, 4th edition (2013), Problem 2.27, printed p. 87 (PDF p. 106). Faithful paraphrase of the original tasks; any extension is marked optional.
