---
id: question-mwcxjb7t-ntzc
subject: Physics
topic: Electrodynamics
---
> [!tip] **Key Questions**
> 1. What are **bound charges**, and how do they arise from polarization?
> 2. Why can the macroscopic field of any polarized object be calculated entirely from its bound charges?
> 3. How does this equivalence naturally lead to the electric displacement $\mathbf{D}$?
## Bound Charges
In a dielectric, bound charges can shift within atoms or molecules. We already have $\mathbf p=q\mathbf d$ for one pair of charges $+q$ and $-q$, with $\mathbf d$ pointing from the negative charge to the positive charge. What I wanted to understand was how this little displacement shows up in a whole piece of material.

Let's start with a simple picture. The positive and negative charges start at the same positions. When the material polarizes, we hold the negative charges fixed and let all the positive charges shift to the right by $\mathbf d$.
```qa-demo
bound-charge-crossing
```
Now I draw a fixed cross section of area $A$ perpendicular to $\mathbf d$ and count how much charge crosses it. Which charges are close enough to make it across? Only the ones that start within a distance $d=|\mathbf d|$ to the left of the cut. So the volume I need to look at is just $Ad$.

If I treat the charge distribution as continuous, with $n$ pairs per unit volume, there are $nAd$ positive charges in that layer. The charge carried across per unit area is then

$$  
\frac{Q_{\mathrm{cross}}}{A}=\frac{q(nAd)}{A}=nqd.  
$$

This is where $qd$ comes back. The $q$ tells me how much charge each crossing carries. The $d$ tells me how far back I need to look to count the charges that cross.

Since each pair contributes $\mathbf p=q\mathbf d$, the dipole moment per unit volume is $\mathbf P=n\mathbf p$, in $\mathrm{C/m^2}$. If I tilt the cut, the same count uses the displacement along its normal $\hat{\mathbf n}$, so the net charge carried across per unit area is $\mathbf P\cdot\hat{\mathbf n}$.

Now picture the right-hand surface of the dielectric. The charge shifted toward that surface accumulates in a thin layer. With vacuum outside and $\hat{\mathbf n}$ pointing outward, that gives the bound surface charge density $$\sigma_{\mathrm b}=\mathbf P\cdot\hat{\mathbf n}.$$
Now I draw a closed surface around a small volume $\mathcal V$ inside the dielectric. If more positive charge goes out than comes in during polarization, what's left inside? A negative net charge. That's where the minus sign comes from.

With $d\mathbf a$ pointing outward, the net bound charge left inside is
$$  
Q_{\mathrm b}(\mathcal V)  
=-\oint_{\partial\mathcal V}\mathbf P\cdot d\mathbf a  
=-\int_{\mathcal V}\nabla\cdot\mathbf P\,d\tau.  
$$
Note that the integration is based on the surface charge $\sigma_{\mathrm b}=\mathbf P\cdot\hat{\mathbf n}$, integrate through the surface, its opposite is the charges remain.

The last step uses the divergence theorem. Since I can choose any small volume inside the dielectric, the bound volume charge density is
$$  
\rho_{\mathrm b}=-\nabla\cdot\mathbf P.  
$$
```qa-demo
bound-charge-slices
```
To answer the first key question and summarize,
1. **Bound charges** stay tied to the material and can shift locally as it polarizes.
2. **Surface charge.** At a surface facing vacuum, $\sigma_{\mathrm b}=\mathbf P\cdot\hat{\mathbf n}$, with $\hat{\mathbf n}$ pointing outward.
3. **Volume charge.** More positive charge out than in leaves negative charge behind. Thus $\rho_{\mathrm b}=-\nabla\cdot\mathbf P$.
## The Field of a Polarized Object
We already know how to find the potential of a single ideal dipole:
$$V(\mathbf{r})=\frac{1}{4\pi\epsilon_0}\frac{\mathbf{p}\cdot\hat{\mathcal{r}}}{\mathcal{r}^2}.$$
A piece of polarized material is just a continuous distribution of such dipoles, with dipole moment per unit volume $\mathbf{P}(\mathbf{r}')$. By superposition the potential becomes
$$V(\mathbf{r})=\frac{1}{4\pi\epsilon_0}\int_{\mathcal{V}}\frac{\mathbf{P}(\mathbf{r}')\cdot\hat{\mathcal{r}}}{\mathcal{r}^2}\,d\tau'.$$

A short rearrangement (integration by parts, or the appropriate vector identity) turns this into
$$V(\mathbf{r})=\frac{1}{4\pi\epsilon_0}\left(
\oint_{\partial\mathcal{V}}\frac{\sigma_b}{\mathcal{r}}\,da'
+\int_{\mathcal{V}}\frac{\rho_b}{\mathcal{r}}\,d\tau'
\right),$$
where $\sigma_b=\mathbf{P}\cdot\hat{\mathbf{n}}$ and $\rho_b=-\nabla\cdot\mathbf{P}$.

This is more than a mathematical trick. It means that the macroscopic potential (and therefore the macroscopic field) of any polarized object is **exactly the same** as the potential produced by its bound surface charge and bound volume charge. We do not need a new method; we simply treat $\sigma_b$ and $\rho_b$ as ordinary charge distributions and use the tools we already have.

Both contributions must be kept in general. When the polarization is uniform, $\rho_b$ vanishes and the entire field comes from the surface bound charge alone.

With this equivalence in hand, we can now introduce the electric displacement $\mathbf{D}$. Since the total charge density is $\rho_f+\rho_b=\rho_f-\nabla\cdot\mathbf{P}$, Gauss’s law reads
$$\nabla\cdot\mathbf{E}=\frac{\rho_f-\nabla\cdot\mathbf{P}}{\epsilon_0}.$$
Defining
$$\mathbf{D}=\epsilon_0\mathbf{E}+\mathbf{P}$$
immediately gives the clean relation
$$\nabla\cdot\mathbf{D}=\rho_f.$$which we'll discuss later.
## Takeaways

> [!note] **Key Insights**
> 1. Bound charges are an exact macroscopic equivalent of polarization.
> 2. This equivalence lets us treat polarized matter with ordinary electrostatic tools and naturally leads to $\mathbf{D} = \epsilon_0\mathbf{E} + \mathbf{P}$, satisfying $\nabla\cdot\mathbf{D} = \rho_f$.

---
> [!warning] **I need it to be simplified!**
> I found it struggling to make everything precise, so may be let it be? Here are what change:
> 1. **For node notes**, I'd like to make everything simpler and emphasizing intuitions.
> 2. **But for examples**, I'll try my best to keep it precise and robust.