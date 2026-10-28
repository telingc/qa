---
id: example-griffiths4e-2-29
parent: question-mv4vnu4t-aonx
---
> [!note] **Key Insights of This Example**
> The source integral and Poisson’s equation are integral and differential formulations of the same electrostatic problem, provided that the same boundary conditions are imposed.
## Questions
For a localized volume charge distribution $\rho(\mathbf r')$, the source expression for potential with zero at infinity is Eq. 2.29:
$$V(\mathbf r)=\frac{1}{4\pi\epsilon_0}\int\frac{\rho(\mathbf r')}{|\mathbf r-\mathbf r'|}\,d\tau'.$$
1. Apply the Laplacian with respect to the observation coordinates $\mathbf r$ and verify Poisson's equation, $\nabla^2V=-\rho(\mathbf r)/\epsilon_0$.
2. Use the distributional kernel identity referenced by the book (Eq. 1.102):$$\nabla_{\mathbf r}^{\,2}\frac{1}{|\mathbf r-\mathbf r'|}=-4\pi\delta^3(\mathbf r-\mathbf r').$$State where the ordinary pointwise calculation is valid and where the delta distribution is needed. The primed coordinates are integration variables, not differentiation variables.
### 1. Applying the Laplacian
For this calculation, assume that the charge density is smooth and vanishes outside a bounded region. I use the distributional kernel identity as a given result here since I'm skipping the mathematical part currently.

The Laplacian acts on the observation coordinates $\mathbf r$, while the source coordinates $\mathbf r'$ are held fixed. Therefore, $\rho(\mathbf r')$ is unaffected by this differentiation.

Using the kernel identity, with differentiation understood in the distributional sense,
$$
\begin{aligned}
\nabla_{\mathbf r}^{2}V(\mathbf r)
&=\frac{1}{4\pi\epsilon_0}
\int \rho(\mathbf r')\,
\nabla_{\mathbf r}^{2}
\frac{1}{|\mathbf r-\mathbf r'|}\,d\tau'\\
&=-\frac{1}{\epsilon_0}
\int \rho(\mathbf r')\,
\delta^{(3)}(\mathbf r-\mathbf r')\,d\tau'\\
&=-\frac{\rho(\mathbf r)}{\epsilon_0}.
\end{aligned}
$$
The last step uses the sifting property:$\displaystyle\int \rho(\mathbf r')\,\delta^{(3)}(\mathbf r-\mathbf r')\,d\tau'=\rho(\mathbf r).$ This verifies Poisson’s equation.
### 2. The Source Singularity
For a fixed source point $\mathbf r'$, ordinary differentiation gives
$$
\nabla_{\mathbf r}^{2}
\frac{1}{|\mathbf r-\mathbf r'|}=0,
\qquad \mathbf r\ne\mathbf r'.
$$
At $\mathbf r=\mathbf r'$, the kernel is singular and its ordinary Laplacian is undefined. The distributional identity includes the contribution of this singularity. Ignoring that contribution would incorrectly give $\nabla^2V=0$ even where charge is present.

> [!warning] **The Scope of This Note**
> Note that I'm using the kernel identity and the sifting property as known results. The derivation of these distributional statements is outside the scope of this note.
## Source
Griffiths, *Introduction to Electrodynamics*, 4th edition (2013), Problem 2.29, printed p. 88 (PDF p. 107). Faithful paraphrase of the original tasks; any extension is marked optional.