import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { definirToken } from "./authStorage";

/**
 * Tela de autenticacao PROVISORIA: mile_bag_api ainda nao tem uma HU de
 * login (usuario/senha) implementada - so emissao/validacao de JWT
 * (JwtService.gerarToken), sem endpoint que a exponha. Ate essa HU existir,
 * a unica forma de autenticar aqui e colando um token ja emitido (ex.: por
 * um script de teste do backend). Nunca colete usuario/senha nesta tela -
 * nada os validaria.
 */
export function LoginDev() {
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  function entrar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!token.trim()) {
      return;
    }
    definirToken(token.trim());
    navigate("/motorista/captura-bdo");
  }

  return (
    <main style={{ maxWidth: 480, margin: "3rem auto", padding: "0 1rem" }}>
      <h1>Milebag — acesso de desenvolvimento</h1>
      <p>
        Ainda não existe uma tela de login real: o back-end não tem endpoint de
        autenticação por usuário/senha nesta fase do projeto, apenas emissão de
        token JWT para uso interno/teste. Cole abaixo um token já emitido para
        continuar.
      </p>
      <form onSubmit={entrar}>
        <label htmlFor="token">Token JWT</label>
        <textarea
          id="token"
          value={token}
          onChange={(evento) => setToken(evento.target.value)}
          rows={4}
          style={{ width: "100%", marginTop: "0.5rem" }}
        />
        <button type="submit" style={{ marginTop: "1rem" }}>
          Entrar
        </button>
      </form>
    </main>
  );
}
