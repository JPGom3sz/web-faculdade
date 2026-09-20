-- =========================================================================
-- ESTRUTURA (schema)
-- =========================================================================

CREATE TABLE especialidade (
    id Serial PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE profissional (
    id Serial PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    especialidade_id INTEGER NOT NULL,
    FOREIGN KEY (especialidade_id) REFERENCES especialidade(id)
);

CREATE TABLE paciente (
    id Serial PRIMARY KEY,
    nome VARCHAR (100) NOT NULL,
    cpf VARCHAR (11) UNIQUE NOT NULL,
    data_nascimento DATE NOT NULL,
    telefone VARCHAR (15) NOT NULL
);

CREATE TABLE disponibilidade (
    id Serial PRIMARY KEY,
    profissional_id INTEGER NOT NULL,
    data DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    disponivel BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_disponibilidade_profissional
        FOREIGN KEY (profissional_id) REFERENCES profissional(id)
);

CREATE TABLE agendamento (
    id Serial PRIMARY KEY,
    paciente_id INTEGER NOT NULL,
    profissional_id INTEGER NOT NULL,
    data DATE NOT NULL,
    hora TIME NOT NULL,
    status VARCHAR (20) NOT NULL DEFAULT 'agendado',
    CONSTRAINT fk_agendamento_paciente
        FOREIGN KEY (paciente_id) REFERENCES paciente(id),
    CONSTRAINT fk_agendamento_profissional
        FOREIGN KEY (profissional_id) REFERENCES profissional(id)
);

-- =========================================================================
-- DADOS DE DEMONSTRACAO (seed)
-- Os IDs de especialidade/profissional batem com o MOCK do script.js do
-- frontend, para os dois lados ficarem consistentes.
-- =========================================================================

INSERT INTO especialidade (id, nome) VALUES
(1, 'Clínico geral'),
(2, 'Nutrição'),
(3, 'Cardiologia');

SELECT setval('especialidade_id_seq', (SELECT MAX(id) FROM especialidade));

INSERT INTO profissional (id, nome, especialidade_id) VALUES
(10, 'Dr. Carlos Andrade', 1),
(11, 'Dra. Fernanda Lima', 1),
(12, 'Dra. Beatriz Souza', 2),
(13, 'Dr. Rafael Nunes', 3);

SELECT setval('profissional_id_seq', (SELECT MAX(id) FROM profissional));

-- Gera horarios (09h-16h) para os proximos 5 dias, para todos os
-- profissionais, sempre relativo a data atual (nunca "vence").
INSERT INTO disponibilidade (profissional_id, data, hora_inicio, hora_fim, disponivel)
SELECT
    p.id,
    d.data,
    h.hora_inicio,
    (h.hora_inicio + interval '1 hour')::time,
    true
FROM profissional p
CROSS JOIN (
    SELECT CURRENT_DATE + n AS data FROM generate_series(1, 5) AS n
) d
CROSS JOIN (
    VALUES ('09:00'::time), ('10:00'::time), ('11:00'::time), ('14:00'::time), ('15:00'::time)
) AS h(hora_inicio);
