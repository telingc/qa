---
id: example-mvi0xoef-q2oaqe
parent: question-mv4vnu4t-aonx
---
> [!note] **Key Insight of This Example**
> 1. **ODE Convenience:** Radial dependence does not imply one-dimensional Cartesian geometry. The coordinate geometry changes the Laplacian, producing different radial solutions in spherical and cylindrical coordinates.
> 2. **The Coordinate Geometry Changes the Laplacian:** Radial dependence does not imply one-dimensional Cartesian geometry. The coordinate geometry changes the Laplacian, producing different radial solutions in spherical and cylindrical coordinates.
## Question
Find the general solution to Laplace's equation in spherical coordinates, for the case where $V$ depends only on $r$. Do the same for cylindrical coordinates, assuming $V$ depends only on $s$.
### Spherical Solution
The complete form of Laplace's equation in the spherical coordinates case is:$$\nabla^2V= \frac1{r^2}\frac{\partial}{\partial r} \left(r^2\frac{\partial V}{\partial r}\right) +\frac1{r^2\sin\theta}\frac{\partial}{\partial\theta} \left(\sin\theta\frac{\partial V}{\partial\theta}\right) +\frac1{r^2\sin^2\theta}\frac{\partial^2V}{\partial\phi^2} =0.$$When $V$ only depends on $r$, the equation simplified into$$\frac1{r^2}\frac{d}{dr}\left(r^2V'(r)\right)=0 \Longrightarrow \frac{d}{dr}\left(r^2V'(r)\right)=0 \Longrightarrow V(r)=A+\frac Br.$$The exact form of the solution could be determined by boundary conditions.
### Cylindrical Solution
Similarly we have the Laplace's equation in the cylindrical case:$$ \nabla^2V = \frac1s\frac{\partial}{\partial s} \left(s\frac{\partial V}{\partial s}\right) +\frac1{s^2}\frac{\partial^2V}{\partial\phi^2} +\frac{\partial^2V}{\partial z^2}.$$Which indicates$$\begin{align*}\nabla^2V&=\frac1s\frac{\partial}{\partial s} \left(s\frac{\partial V}{\partial s}\right)=0\end{align*}.$$The solution to the equation is$$V(s)=C+D\ln\frac{s}{s_0}$$
> [!tip] **Laplace's Equation in Different Coordinates**
> I'm not offering the full details of calculations here, but the general idea is quite straight forward, The Laplacian is the divergence of the gradient.:
> 1. Obtain the gradient from the physical distances associated with coordinate increments.
> 2. Calculate its divergence as the limiting net outward flux per unit volume of a shrinking coordinate cell. For example:$$\mathbf F=F_s\hat{\mathbf s}+F_\phi\hat{\boldsymbol\phi} +F_z\hat{\mathbf z}\\\lim_{\Delta s,\Delta\phi,\Delta z\to0} \frac{\Delta\Phi_s}{\Delta\mathcal V}= \frac1s\frac{\partial(sF_s)}{\partial s}.$$Here $\mathbf F$ is a generic continuously differentiable vector field. To obtain the Laplacian, set $\mathbf F=\nabla V$.
## Source
Griffiths, *Introduction to Electrodynamics*, 4th edition (2013), Problem 3.3, printed p.119. Faithful paraphrase of the original tasks; any extension is marked optional.