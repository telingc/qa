---
id: question-mwprqyv4-nxur
subject: Physics
topic: Electrodynamics
---
> [!tip] **Key Questions**
> 1. How does the electric displacement $\mathbf D$ help we find $\mathbf E$ in a dielectric when the free charge distribution is known?
> 2. The reason of introducing **displacement** $\mathbf D$.
## Gauss' Law
When considering systems containing dielectrics, the total charge distribution consists of the free charges and bound charges:$$\rho_\text{total}=\rho_f+\rho_b$$We have a good reason to believe that Gauss' law stands for all cases, which means ideally, we could have$$\nabla\cdot\mathbf E=\frac{\rho_\text{total}}{\epsilon_0}$$But from a higher perspective (I literally have no idea), it's impossible to investigate into all the charges, especially bound charges inside dielectric materials. Thus we come up with an idea, or say an *abstraction*: the electric displacement $\mathbf D$.$$\begin{align*}\epsilon_0\nabla\cdot\mathbf E&=\rho_f+\rho_b\\\Rightarrow\nabla\cdot(\epsilon_0\,\mathbf E+\mathbf P)&=\rho_f\end{align*}$$Thus we define:$$\text{DEFINITION:}\quad\mathbf D=\epsilon_0\,\mathbf E+\mathbf P.$$In terms of $\mathbf D$, Gauss' law reads$$\nabla\cdot\mathbf D=\rho_f,$$and its integral form$$\oint_{\partial V}\mathbf D\cdot d\,\mathbf a=Q_{f_\text{enc}}$$
## About Displacement
**Displacement is an abstraction, a way of description of systems involves complex fields like dielectrics**, in this kind of context, it's useful because it makes reference only to free charges, and free charges is the stuff we control.

Then we have our answer to the *Key Questions*:
> [!note] **Key Insights**
> 1. For most cases, polarization is proportional to the field, with displacement $\mathbf D$ when free charges are known, the bound charges ensue. Then we're able to describe the system.
> 2. Displacement is an abstraction, a way of description of systems involves complex fields like dielectrics.
